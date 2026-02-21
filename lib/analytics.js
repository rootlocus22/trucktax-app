export function trackEvent(name, properties = {}) {
  if (typeof window === 'undefined') return;

  try {
    // Vercel Analytics custom event (if package is available in runtime)
    import('@vercel/analytics').then((mod) => {
      if (typeof mod.track === 'function') {
        mod.track(name, properties);
      }
    }).catch(() => {
      // No-op when analytics package isn't available at runtime
    });
  } catch {
    // Keep analytics fire-and-forget
  }

  try {
    // Optional GA/GTM compatibility if present
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, properties);
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...properties });
    }
  } catch {
    // Ignore analytics transport errors
  }
}

/**
 * Server-side or build-time analytics log. Use from API routes or server code.
 * Logs structured JSON to console; in production you can extend this to write to Firestore or a log service.
 */
export function logAnalytics(event, data = {}) {
  const payload = {
    event,
    ...data,
    ts: new Date().toISOString(),
    env: process.env.NODE_ENV,
  };
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[analytics]', JSON.stringify(payload));
    } else {
      console.info('[analytics]', JSON.stringify(payload));
    }
  } catch {
    // no-op
  }
}
