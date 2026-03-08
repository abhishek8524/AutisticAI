import prisma from "../src/lib/prisma.js";
import { model } from "../src/lib/gemini.js";

const GOOGLE_PLACES_KEY = "AIzaSyDQPEAaRMgkTVMJeSeKrB_EZHPO79ZE34w";

const SEARCH_QUERIES = [
    "libraries in Waterloo Ontario",
    "parks in Waterloo Ontario",
    "cafes in Waterloo Ontario",
    "museums in Kitchener Waterloo Ontario",
    "restaurants in Waterloo Ontario",
    "community centres in Kitchener Ontario",
    "bookstores in Waterloo Ontario",
    "shopping in Kitchener Waterloo Ontario",
    "quiet places in Waterloo Ontario",
    "nature trails in Kitchener Waterloo Ontario",
];

const CATEGORY_MAP = {
    library: "library",
    book_store: "bookstore",
    park: "park",
    cafe: "cafe",
    restaurant: "restaurant",
    museum: "museum",
    shopping_mall: "retail",
    store: "retail",
    tourist_attraction: "attraction",
    art_gallery: "museum",
    church: "worship",
    gym: "fitness",
    spa: "wellness",
    movie_theater: "entertainment",
    bar: "bar",
    night_club: "nightlife",
    school: "education",
    university: "education",
};

function classifyCategory(types) {
    for (const type of types || []) {
        if (CATEGORY_MAP[type]) return CATEGORY_MAP[type];
    }
    return "other";
}

async function searchPlaces(query) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

async function getPlaceDetails(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,types,reviews,rating,editorial_summary&key=${GOOGLE_PLACES_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.result || null;
}

async function analyzePlaceWithGemini(name, category, reviews) {
    const reviewTexts = reviews.map((r, i) => `Review ${i + 1} (${r.rating}/5 stars): ${r.text}`).join("\n\n");

    const prompt = `You are a sensory environment analyst helping people with autism and sensory sensitivities evaluate public spaces.

Given these Google reviews for "${name}" (${category}):

${reviewTexts}

Analyze the sensory environment and return ONLY a valid JSON object with this exact structure (no markdown, no backticks, no explanation):
{
  "noiseScore": <number 1.0-5.0, where 1=very quiet, 5=very loud>,
  "lightingScore": <number 1.0-5.0, where 1=very dim/soft, 5=very bright/harsh>,
  "crowdScore": <number 1.0-5.0, where 1=empty/sparse, 5=very crowded>,
  "comfortScore": <number 1.0-5.0, overall sensory comfort for sensitive individuals, 5=most comfortable>,
  "reviews": [
    {
      "bodyText": "<a realistic sensory-focused review from perspective of a sensory-sensitive visitor, 2-3 sentences>",
      "rating": <number 1-10, overall comfort rating>,
      "noiseLevel": <number 1-10>,
      "lightingLevel": <number 1-10>,
      "crowdLevel": <number 1-10>
    },
    {
      "bodyText": "<second unique sensory-focused review>",
      "rating": <number 1-10>,
      "noiseLevel": <number 1-10>,
      "lightingLevel": <number 1-10>,
      "crowdLevel": <number 1-10>
    },
    {
      "bodyText": "<third unique sensory-focused review>",
      "rating": <number 1-10>,
      "noiseLevel": <number 1-10>,
      "lightingLevel": <number 1-10>,
      "crowdLevel": <number 1-10>
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
}

// ─── Main Seed Flow ──────────────────────────────────────────

console.log("🌱 Starting enhanced seed with Google Places + Gemini...\n");

// Step 0: Clean database
console.log("🗑️  Cleaning database...");
await prisma.review.deleteMany({});
await prisma.savedPlace.deleteMany({});
await prisma.sensoryScore.deleteMany({});
await prisma.sensoryProfile.deleteMany({});
await prisma.location.deleteMany({});

// Step 1: Fetch places from Google
console.log("📍 Fetching places from Google Places API...\n");
const seenPlaceIds = new Set();
const allPlaces = [];

for (const query of SEARCH_QUERIES) {
    console.log(`  Searching: "${query}"`);
    const results = await searchPlaces(query);

    for (const place of results) {
        if (seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);
        allPlaces.push(place);
    }

    await new Promise((r) => setTimeout(r, 300));
}

console.log(`\n  Found ${allPlaces.length} unique places. Taking top 30...\n`);
const selectedPlaces = allPlaces.slice(0, 30);

// Step 2: Get details + reviews for each place
console.log("📝 Fetching details and reviews for each place...\n");
const placesWithDetails = [];

for (const place of selectedPlaces) {
    try {
        const details = await getPlaceDetails(place.place_id);
        if (!details) continue;

        const reviews = details.reviews || [];
        if (reviews.length === 0) {
            console.log(`  ⚠️  ${details.name} — no reviews, skipping`);
            continue;
        }

        placesWithDetails.push({
            name: details.name,
            address: details.formatted_address,
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            category: classifyCategory(details.types),
            description: details.editorial_summary?.overview || null,
            googleRating: details.rating,
            reviews: reviews.slice(0, 5),
        });

        console.log(`  ✅ ${details.name} (${reviews.length} reviews)`);
        await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
        console.log(`  ❌ Failed for ${place.name}: ${err.message}`);
    }
}

console.log(`\n  Got details for ${placesWithDetails.length} places.\n`);

// Step 3: Analyze with Gemini + insert into DB
console.log("🤖 Analyzing with Gemini and inserting into database...\n");

const testUser = await prisma.user.upsert({
    where: { auth0Id: "test|seed-user" },
    update: {},
    create: {
        auth0Id: "test|seed-user",
        email: "seed@sensorysafe.com",
        username: "SensorySafe Bot",
    },
});

let successCount = 0;

for (const place of placesWithDetails) {
    try {
        console.log(`  🔄 Analyzing: ${place.name}...`);

        const analysis = await analyzePlaceWithGemini(place.name, place.category, place.reviews);

        const location = await prisma.location.create({
            data: {
                name: place.name,
                description: place.description,
                category: place.category,
                address: place.address,
                latitude: place.latitude,
                longitude: place.longitude,
            },
        });

        await prisma.sensoryScore.create({
            data: {
                locationId: location.id,
                noiseScore: analysis.noiseScore,
                lightingScore: analysis.lightingScore,
                crowdScore: analysis.crowdScore,
                comfortScore: analysis.comfortScore,
                reviewCount: analysis.reviews.length,
            },
        });

        for (const review of analysis.reviews) {
            await prisma.review.create({
                data: {
                    userId: testUser.id,
                    locationId: location.id,
                    bodyText: review.bodyText,
                    rating: review.rating,
                    noiseLevel: review.noiseLevel,
                    lightingLevel: review.lightingLevel,
                    crowdLevel: review.crowdLevel,
                },
            });
        }

        successCount++;
        console.log(`  ✅ ${place.name} — scores: noise=${analysis.noiseScore}, light=${analysis.lightingScore}, crowd=${analysis.crowdScore}, comfort=${analysis.comfortScore}`);

        await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
        console.log(`  ❌ Failed for ${place.name}: ${err.message}`);
    }
}

console.log(`\n✨ Done! Seeded ${successCount} locations with sensory scores and reviews.`);
await prisma.$disconnect();
