// A separate file, not an inline script, so the Content-Security-Policy can forbid inline scripts.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}))
}
