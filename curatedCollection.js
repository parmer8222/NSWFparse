const nswfparse = require("./src/index.js");
const library = nswfparse.library;

async function getCuratedLibrary() {
  try {
    console.log("🔄 Fetching curated collection from available sources...\n");
    
    const collection = await library.getCuratedCollection({
      rule34Count: 0,    // Skip Rule34 (requires auth)
      rule31Count: 0,    // Skip Rule31 (API issues)
      pornhubCount: 3,   // Get Pornhub videos
      redditCount: 3     // Get Reddit posts
    });

    console.log("✅ Collection Retrieved!\n");
    console.log("📊 Stats:");
    console.log(`   Pornhub videos: ${collection.pornhub.length}`);
    console.log(`   Reddit posts: ${collection.reddit.length}`);
    console.log(`   Total items: ${collection.pornhub.length + collection.reddit.length}\n`);

    if (collection.reddit.length > 0) {
      console.log("📋 Reddit Posts:\n");
      collection.reddit.forEach((post, i) => {
        console.log(`${i + 1}. ${post.url}`);
        console.log(`   Source: ${post.source}`);
        console.log(`   NSFW: ${post.nsfw}\n`);
      });
    }

    if (collection.pornhub.length > 0) {
      console.log("📋 Pornhub Videos:\n");
      collection.pornhub.forEach((video, i) => {
        console.log(`${i + 1}. ${JSON.stringify(video)}\n`);
      });
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

getCuratedLibrary();
