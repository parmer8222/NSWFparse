const { fetchRule34Posts } = require("./r34Handler");
const { fetchRule31Posts } = require("./rule31Handler");
const { fetchPornhubVideos } = require("./pornhubHandler");
const { fetchRedditPost } = require("./redditHandler");

/**
 * LibraryManager - Central porn library aggregator
 * Combines all sources into one unified interface
 */
class LibraryManager {
    constructor() {
        this.sources = {
            rule34: fetchRule34Posts,
            rule31: fetchRule31Posts,
            pornhub: fetchPornhubVideos,
            reddit: fetchRedditPost,
        };
        this.cache = new Map();
    }

    /**
     * Get content from a specific source
     * @param {string} source - 'rule34', 'rule31', 'pornhub', or 'reddit'
     * @param {object} options - Source-specific options
     */
    async getFromSource(source, options = {}) {
        if (!this.sources[source]) {
            throw new Error(
                `Source '${source}' not found. Available: ${Object.keys(this.sources).join(", ")}`
            );
        }

        try {
            const result = await this.sources[source](options);
            return { source, ...result };
        } catch (error) {
            throw new Error(`Error fetching from ${source}: ${error.message}`);
        }
    }

    /**
     * Get content from multiple sources in parallel
     * @param {array} sources - Array of source names
     * @param {object} options - Options for all sources
     */
    async getFromMultipleSources(sources, options = {}) {
        const promises = sources.map((source) =>
            this.getFromSource(source, options).catch((error) => ({
                source,
                error: error.message,
            }))
        );

        const results = await Promise.all(promises);
        return results;
    }

    /**
     * Get random content from all sources
     */
    async getRandomFromAll(options = {}) {
        const sourceNames = Object.keys(this.sources);
        const randomSource =
            sourceNames[Math.floor(Math.random() * sourceNames.length)];
        return this.getFromSource(randomSource, options);
    }

    /**
     * Search across all sources
     * @param {string} query - Search query
     */
    async searchAll(query) {
        const searchOptions = {
            tags: query.split(" "),
            query: query,
            subreddits: [query],
        };

        return this.getFromMultipleSources(
            Object.keys(this.sources),
            searchOptions
        );
    }

    /**
     * Get content with rotation through sources
     * Useful for variety in results
     */
    async getRotating(options = {}, count = 5) {
        const sourceNames = Object.keys(this.sources);
        const results = [];

        for (let i = 0; i < count; i++) {
            const source = sourceNames[i % sourceNames.length];
            try {
                const result = await this.getFromSource(source, options);
                results.push(result);
            } catch (error) {
                results.push({ source, error: error.message });
            }
        }

        return results;
    }

    /**
     * Get curated collection
     * Combines different types of content
     */
    async getCuratedCollection(preferences = {}) {
        const {
            rule34Count = 2,
            rule31Count = 2,
            pornhubCount = 3,
            redditCount = 2,
        } = preferences;

        const collection = {
            rule34: [],
            rule31: [],
            pornhub: [],
            reddit: [],
        };

        try {
            // Fetch from each source
            if (rule34Count > 0) {
                const r34 = await this.getFromSource("rule34", { limit: rule34Count });
                collection.rule34 = r34.posts || [];
            }

            if (rule31Count > 0) {
                const r31 = await this.getFromSource("rule31", { limit: rule31Count });
                collection.rule31 = r31.posts || [];
            }

            if (pornhubCount > 0) {
                const ph = await this.getFromSource("pornhub", {
                    limit: pornhubCount,
                });
                collection.pornhub = ph.videos || [];
            }

            if (redditCount > 0) {
                for (let i = 0; i < redditCount; i++) {
                    try {
                        const reddit = await this.getFromSource("reddit", {
                            subreddits: ["nsfw"],
                        });
                        collection.reddit.push(reddit);
                    } catch (e) {
                        // Continue if one fails
                    }
                }
            }

            return collection;
        } catch (error) {
            throw new Error(`Error creating curated collection: ${error.message}`);
        }
    }

    /**
     * Get stats on available sources
     */
    getStats() {
        return {
            availableSources: Object.keys(this.sources),
            sourceCount: Object.keys(this.sources).length,
            cacheSize: this.cache.size,
        };
    }
}

module.exports = { LibraryManager };
