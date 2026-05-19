// Shared arXiv rate limiter — arXiv allows ~1 req per 3s per IP.
// Both arxivSearch and arxivDownload share the same timer to avoid 429.
let lastRequestTime = 0;

export function enforceArxivRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  const wait = Math.max(0, 3000 - elapsed);
  lastRequestTime = now + wait;
  if (wait > 0) {
    return new Promise((resolve) => setTimeout(resolve, wait));
  }
  return Promise.resolve();
}
