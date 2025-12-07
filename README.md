# NSWFparse

Your all-in-one porn library aggregator. Access content from Rule34, Rule31, Pornhub, and Reddit from a single unified interface.

## Installation

```shell
npm install nswfparse
```

## Quick Start

```js
const nswfparse = require("nswfparse");

// Use the unified library manager
const library = nswfparse.library;

// Get random content from any source
library.getRandomFromAll()
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Individual Handlers

### Rule34

```js
const options = {
  tags: ["toys", "forest"],
  numPage: 1,
  limit: 1,
  removeEmpty: true,
  parseTags: true,
  random: false,
};
nswfparse
  .rule34(options)
  .then((payload) => console.log(payload))
  .catch((error) => console.error(error));
```

### Rule31

```js
nswfparse
  .rule31({ tags: ["hentai"], limit: 5 })
  .then((payload) => console.log(payload))
  .catch((error) => console.error(error));
```

### Pornhub

```js
const pornhubOptions = {
  query: "popular",
  limit: 20,
  pageNum: 1,
  orderBy: "newest" // newest, views, rating
};
nswfparse
  .pornhub(pornhubOptions)
  .then((payload) => console.log(payload))
  .catch((error) => console.error(error));
```

### Reddit - Custom Subreddit

```js
nswfparse
  .redditCustom(["cats"])
  .then((payload) => console.log(payload))
  .catch((error) => console.error(error));
```

## Library Manager - Unified Interface

Access all sources from one central hub:

### Get From Specific Source

```js
const library = nswfparse.library;

library.getFromSource("pornhub", { query: "popular", limit: 10 })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Get From Multiple Sources (Parallel)

```js
library.getFromMultipleSources(["rule34", "pornhub", "reddit"])
  .then(results => console.log(results))
  .catch(err => console.error(err));
```

### Get Random From Any Source

```js
library.getRandomFromAll({ limit: 5 })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Search Across All Sources

```js
library.searchAll("hentai")
  .then(results => console.log(results))
  .catch(err => console.error(err));
```

### Get Rotating Content (For Variety)

```js
// Gets content from sources in rotation
library.getRotating({ limit: 5 }, 10)
  .then(results => console.log(results))
  .catch(err => console.error(err));
```

### Get Curated Collection (Mixed)

```js
library.getCuratedCollection({
  rule34Count: 5,
  rule31Count: 3,
  pornhubCount: 10,
  redditCount: 5
})
  .then(collection => console.log(collection))
  .catch(err => console.error(err));
```

### Get Library Stats

```js
console.log(library.getStats());
// Output: { availableSources: [...], sourceCount: 4, cacheSize: 0 }
```

## Available Handlers

### Rule34 Handler

- Fetch NSFW posts from Rule34
- Requires: `tags` array, optional `limit`, `numPage`, `random`
- API: `api.rule34.xxx`

### Rule31 Handler

- Fetch NSFW posts from Rule31
- Requires: `tags` array, optional `limit`, `numPage`, `random`
- API: `api.rule31.xxx`

### Pornhub Handler

- Fetch videos from Pornhub
- Requires: `query` string, optional `limit`, `pageNum`, `orderBy`
- Ordering options: `newest`, `views`, `rating`
- Returns video metadata from Pornhub webmaster API
- API: `pornhub.com/webmaster`

### Reddit Handler

- Fetch posts from custom subreddit(s)
- Usage: `redditCustom(['subreddit1', 'subreddit2'])`
- Randomly picks from provided subreddits
- Filters for image/media content

## Exports

- `rule34` / `r34` - Rule34 handler
- `rule31` - Rule31 handler
- `pornhub` - Pornhub handler
- `redditCustom` - Reddit handler
- `library` - Pre-initialized LibraryManager instance
- `LibraryManager` - LibraryManager class for custom instances

## TODO

- [x] Add Rule34
- [x] Add Rule31
- [x] Add Pornhub
- [x] Add Library Manager
- [ ] Add Xvideos
- [ ] Add caching layer
- [ ] Add rate limiting
