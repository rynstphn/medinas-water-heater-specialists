/* Vercel Speed Insights Initialization
 * This script initializes Vercel Speed Insights for tracking web vitals.
 * The tracking script is automatically served by Vercel at /_vercel/speed-insights/script.js
 * when Speed Insights is enabled in the Vercel dashboard.
 */

(function() {
  'use strict';
  
  // Initialize the queue for Speed Insights events
  function initQueue() {
    if (window.si) return;
    window.si = function(...params) {
      window.siq = window.siq || [];
      window.siq.push(params);
    };
  }
  
  // Inject the Speed Insights script
  function injectSpeedInsights() {
    // Don't inject if already present
    const scriptSrc = '/_vercel/speed-insights/script.js';
    if (document.head.querySelector(`script[src*="${scriptSrc}"]`)) {
      return null;
    }
    
    // Initialize the queue first
    initQueue();
    
    // Create and configure the script element
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.defer = true;
    
    // Add SDK identification
    script.dataset.sdkn = '@vercel/speed-insights';
    script.dataset.sdkv = '2.0.0';
    
    // Handle load errors
    script.onerror = function() {
      console.log(
        `[Vercel Speed Insights] Failed to load script from ${scriptSrc}. ` +
        'Please check if any content blockers are enabled and try again.'
      );
    };
    
    // Inject the script
    document.head.appendChild(script);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSpeedInsights);
  } else {
    injectSpeedInsights();
  }
})();
