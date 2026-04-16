/**
 * Drop-in script for any website: reports JS errors and unhandled promise rejections
 * to this platform's API gateway. Configure endpoint and optional siteKey.
 *
 * Usage (replace ENDPOINT with your gateway URL, e.g. http://localhost:8084):
 *   <script src="https://your-cdn/browser-error-snippet.js"
 *     data-endpoint="http://YOUR_GATEWAY:8084/api/client-errors"
 *     data-site-key="customer-shop-1" async defer></script>
 */
(function () {
  var scripts = document.getElementsByTagName("script");
  var s = scripts[scripts.length - 1];
  var endpoint = s.getAttribute("data-endpoint");
  var siteKey = s.getAttribute("data-site-key") || "";

  if (!endpoint) {
    console.warn("[browser-error-snippet] missing data-endpoint");
    return;
  }

  function send(payload) {
    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      var ok = navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: "application/json" }),
      );
      if (ok) return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      mode: "cors",
      keepalive: true,
    }).catch(function () {});
  }

  window.addEventListener("error", function (ev) {
    send({
      message: ev.message || String(ev.error),
      stack: ev.error && ev.error.stack ? ev.error.stack : "",
      url: window.location.href,
      line: ev.lineno,
      column: ev.colno,
      userAgent: navigator.userAgent,
      siteKey: siteKey,
      extra: {
        scriptUrl: ev.filename || "",
        type: "error",
      },
    });
  });

  window.addEventListener("unhandledrejection", function (ev) {
    var reason = ev.reason;
    send({
      message: reason && reason.message ? reason.message : String(reason),
      stack: reason && reason.stack ? reason.stack : "",
      url: window.location.href,
      userAgent: navigator.userAgent,
      siteKey: siteKey,
      extra: { page: window.location.href, type: "unhandledrejection" },
    });
  });
})();
