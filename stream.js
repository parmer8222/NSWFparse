const express = require('express');
const nswfparse = require('./src/index.js');
const app = express();

const PORT = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// API endpoint to get random content
app.get('/api/random', async (req, res) => {
    try {
        const source = req.query.source || 'reddit';
        let data;

        if (source === 'reddit') {
            data = await nswfparse.redditCustom(['nsfw']);
            data = { source: 'reddit', ...data };
        } else {
            data = await nswfparse.library.getFromSource(source, {});
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to get from multiple sources
app.get('/api/collection', async (req, res) => {
    try {
        const sources = req.query.sources?.split(',') || ['reddit'];
        const results = await nswfparse.library.getFromMultipleSources(sources);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to search
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || 'nsfw';
        const results = await nswfparse.library.searchAll(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Web UI endpoint
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>NSWFparse Streaming</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      max-width: 800px;
      width: 100%;
      padding: 40px;
    }
    h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover { background: #764ba2; }
    button:active { transform: scale(0.95); }
    select {
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ddd;
    }
    .content-area {
      background: #f5f5f5;
      border-radius: 5px;
      padding: 20px;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    img, video {
      max-width: 100%;
      max-height: 400px;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    .info {
      width: 100%;
      background: white;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
      text-align: center;
    }
    .info a {
      color: #667eea;
      text-decoration: none;
    }
    .info a:hover { text-decoration: underline; }
    .loading {
      color: #667eea;
      font-weight: bold;
    }
    .error {
      color: #e74c3c;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔞 NSWFparse Streaming</h1>
    
    <div class="controls">
      <select id="source">
        <option value="reddit">Reddit</option>
        <option value="rule34">Rule34</option>
        <option value="rule31">Rule31</option>
        <option value="pornhub">Pornhub</option>
      </select>
      <button onclick="loadRandom()">Get Random</button>
      <button onclick="loadNext()">Next</button>
      <button onclick="loadCuration()">Curated Mix</button>
    </div>

    <div class="content-area" id="content">
      <p style="color: #999;">Click "Get Random" to start streaming</p>
    </div>
  </div>

  <script>
    let currentUrl = null;

    function loadRandom() {
      const source = document.getElementById('source').value;
      const content = document.getElementById('content');
      content.innerHTML = '<p class="loading">Loading...</p>';

      fetch(\`/api/random?source=\${source}\`)
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            content.innerHTML = \`<p class="error">Error: \${data.error}</p>\`;
            return;
          }

          currentUrl = data;
          let html = '';

          if (data.url) {
            if (data.url.match(/\\.(jpg|jpeg|png|gif)$/i)) {
              html = \`<img src="\${data.url}" alt="Content">\`;
            } else if (data.url.match(/\\.(mp4|webm|mov)$/i)) {
              html = \`<video controls><source src="\${data.url}"></video>\`;
            } else {
              html = \`<a href="\${data.url}" target="_blank">Open in new tab</a>\`;
            }
          }

          html += \`
            <div class="info">
              <p><strong>Source:</strong> \${data.source || 'Unknown'}</p>
              <p><strong>URL:</strong> <a href="\${data.url}" target="_blank">Open</a></p>
              <p><strong>NSFW:</strong> \${data.nsfw ? 'Yes' : 'No'}</p>
            </div>
          \`;

          content.innerHTML = html;
        })
        .catch(err => {
          content.innerHTML = \`<p class="error">Error: \${err.message}</p>\`;
        });
    }

    function loadNext() { loadRandom(); }

    function loadCuration() {
      const content = document.getElementById('content');
      content.innerHTML = '<p class="loading">Loading curated collection...</p>';

      fetch('/api/collection?sources=reddit')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const item = data[0];
            if (item && !item.error) {
              loadRandom();
            } else {
              content.innerHTML = '<p class="error">No content available</p>';
            }
          }
        })
        .catch(err => {
          content.innerHTML = \`<p class="error">Error: \${err.message}</p>\`;
        });
    }
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║   🔞 NSWFparse Streaming Server     ║
║   http://localhost:${PORT}           ║
║                                      ║
║   Open in your browser to stream!   ║
╚══════════════════════════════════════╝
  `);
});
