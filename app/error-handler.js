// Global error handler to suppress AbortErrors from browser extensions
if (typeof window !== 'undefined') {
  // Suppress ALL AbortErrors - they're usually from browser extensions interfering with fetch
  const originalError = console.error;
  console.error = function(...args) {
    // Filter out ALL AbortErrors - they're harmless and caused by browser extensions
    const errorString = args.join(' ');
    if (
      errorString.includes('AbortError') || 
      errorString.includes('aborted') ||
      errorString.includes('signal is aborted')
    ) {
      // Silently ignore ALL AbortErrors - they don't affect functionality
      return;
    }
    originalError.apply(console, args);
  };

  // Catch unhandled promise rejections - suppress ALL AbortErrors
  const originalUnhandledRejection = window.onunhandledrejection;
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const errorString = error?.toString() || '';
    const stackString = error?.stack || '';
    
    // Suppress ALL AbortErrors - they're from browser extensions interfering with network requests
    if (
      error?.name === 'AbortError' || 
      errorString.includes('AbortError') ||
      errorString.includes('aborted') ||
      errorString.includes('signal is aborted') ||
      stackString.includes('frame_ant') ||
      stackString.includes('webchannel') ||
      stackString.includes('extension')
    ) {
      // Prevent the error from showing in console
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Use capture phase to catch early

  // Also catch regular errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    const errorString = error?.toString() || '';
    const stackString = error?.stack || '';
    const message = event.message || '';
    
    // Suppress ALL AbortErrors
    if (
      error?.name === 'AbortError' ||
      errorString.includes('AbortError') ||
      errorString.includes('aborted') ||
      errorString.includes('signal is aborted') ||
      stackString.includes('frame_ant') ||
      stackString.includes('webchannel')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    // Suppress Cross-Origin-Opener-Policy warnings (harmless Firebase Auth popup warnings)
    if (
      message.includes('Cross-Origin-Opener-Policy') ||
      message.includes('window.closed')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Use capture phase

  // Suppress console warnings about Cross-Origin-Opener-Policy
  const originalWarn = console.warn;
  console.warn = function(...args) {
    const warningString = args.join(' ');
    if (
      warningString.includes('Cross-Origin-Opener-Policy') ||
      warningString.includes('window.closed')
    ) {
      // Silently ignore these harmless warnings
      return;
    }
    originalWarn.apply(console, args);
  };
}

