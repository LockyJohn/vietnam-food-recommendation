#!/usr/bin/env node

const REQUIRED_ENV = ["GOOGLE_MAPS_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const TABLE_NAME = process.env.SUPABASE_TABLE || "restaurant_recommendations";
const BUCKET_NAME = process.env.SUPABASE_PHOTO_BUCKET || "restaurant-photos";
const CITY = process.env.PRIMARY_CITY || "胡志明";

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. See README.md for setup.`);
    process.exit(1);
  }
}

const googleKey = process.env.GOOGLE_MAPS_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const rows = await supabaseRequest(
    `/rest/v1/${TABLE_NAME}?select=id,name,maps_url,city,area,google_place_id,rating,review_count,photo_url&status=eq.published&city=eq.${encodeURIComponent(CITY)}&order=created_at.desc`,
  );
  const targets = rows.filter((row) => !row.rating || !row.review_count || !row.photo_url);

  console.log(`Found ${rows.length} published rows, ${targets.length} need Google data.`);

  for (const row of targets) {
    try {
      const place = row.google_place_id ? await getPlaceDetails(row.google_place_id) : await searchPlace(row);
      if (!place) {
        console.log(`SKIP ${row.name}: no Google place match`);
        continue;
      }

      const photoUrl = place.photos?.[0]?.name ? await uploadPlacePhoto(row.id, place.photos[0].name) : row.photo_url;
      await updateRestaurant(row.id, {
        google_place_id: place.id || row.google_place_id,
        rating: place.rating ?? row.rating,
        review_count: place.userRatingCount ?? row.review_count,
        photo_url: photoUrl || row.photo_url,
        google_data_updated_at: new Date().toISOString(),
      });
      console.log(`OK ${row.name}`);
    } catch (error) {
      console.error(`FAIL ${row.name}: ${error.message}`);
    }
  }
}

async function searchPlace(row) {
  const textQuery = `${row.name} ${row.area || ""} Ho Chi Minh City Vietnam`;
  const result = await googleRequest("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.photos",
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "zh-CN",
      regionCode: "VN",
      maxResultCount: 1,
    }),
  });

  return result.places?.[0] || null;
}

async function getPlaceDetails(placeId) {
  return googleRequest(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": googleKey,
      "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,photos",
    },
  });
}

async function uploadPlacePhoto(rowId, photoName) {
  const photoResponse = await fetch(
    `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&key=${encodeURIComponent(googleKey)}`,
  );

  if (!photoResponse.ok) {
    throw new Error(`Google photo failed: ${photoResponse.status} ${await photoResponse.text()}`);
  }

  const contentType = photoResponse.headers.get("content-type") || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : "jpg";
  const objectPath = `${rowId}.${extension}`;
  const bytes = Buffer.from(await photoResponse.arrayBuffer());

  await supabaseRequest(`/storage/v1/object/${BUCKET_NAME}/${objectPath}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: bytes,
    raw: true,
  });

  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${objectPath}`;
}

async function updateRestaurant(id, patch) {
  await supabaseRequest(`/rest/v1/${TABLE_NAME}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
    raw: true,
  });
}

async function googleRequest(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Google request failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  if (options.raw || response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

main();
