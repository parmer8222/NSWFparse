async function fetchPornhubVideos(options = {}) {
    if (!options.query) options.query = "popular";
    if (typeof options.limit !== "number") options.limit = 20;
    options.limit = Math.min(options.limit, 100);

    const pageNum = options.pageNum || 1;
    const orderBy = options.orderBy || "newest"; // newest, views, rating

    const apiUrl = `https://www.pornhub.com/webmaster/search?search=${encodeURIComponent(
        options.query
    )}&page=${pageNum}&ordering=${orderBy}&limit=${options.limit}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok)
            throw new Error(`Network response was not ok: ${response.statusText}`);

        const responseText = await response.text();
        const jsonResponse = JSON.parse(responseText);

        return { videos: jsonResponse.videos || [] };
    } catch (error) {
        throw new Error(`Fetch error: ${error.message}`);
    }
}

module.exports = { fetchPornhubVideos };
