// Runs in front of the static site on Cloudflare: www and plain http are permanently
// redirected to https://tarchief.studio (same path and query); everything else is served
// from the built assets.

const CANONICAL_HOST = 'tarchief.studio';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === `www.${CANONICAL_HOST}` || (url.hostname === CANONICAL_HOST && url.protocol === 'http:')) {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  }
};
