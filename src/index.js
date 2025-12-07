const { fetchRule34Posts } = require("./handlers/r34Handler");
const { fetchRule31Posts } = require("./handlers/rule31Handler");
const { fetchRedditPost } = require("./handlers/redditHandler");
const { fetchPornhubVideos } = require("./handlers/pornhubHandler");
const { LibraryManager } = require("./handlers/libraryManager");

const handlers = {
  r34: fetchRule34Posts,
  rule34: fetchRule34Posts,
  rule31: fetchRule31Posts,
  pornhub: fetchPornhubVideos,
  redditCustom: fetchRedditPost,
};

// Export both individual handlers and the library manager
module.exports = {
  ...handlers,
  LibraryManager,
  library: new LibraryManager(),
};
