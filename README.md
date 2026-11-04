# Ohio Search

A small, branded web-search site. It shows results on its own page and does not redirect searches to Google. Web results come from the Brave Search API; this is not a self-operated whole-web crawler/index.

## Run locally

Requirements: Node.js 20 or newer and a Brave Search API key.

1. Copy `.env.example` to `.env` and add your API key.
2. Install and start:

   ```sh
   npm install
   npm start
   ```
3. Visit http://localhost:3000.

Keep the API key private. Do not put it in browser code or commit it to GitHub.

## Deploy with HTTPS on Render

1. Create a Brave Search API key at https://brave.com/search/api/.
2. In Render, create a **Web Service** from this GitHub repository.
3. Choose the Node runtime. The build command is `npm install`; the start command is `npm start`.
4. In the service's **Environment** settings, add `BRAVE_API_KEY` with your key. Never add it to a committed file.
5. Deploy. Render provides an HTTPS URL and manages its TLS certificate; use the URL beginning with `https://`.

The included `render.yaml` can prefill the service configuration. The API key must still be added privately in Render. The service uses Helmet security headers, server-side secrets, input limits, and rate limiting. Search-result text is inserted as text rather than HTML.
