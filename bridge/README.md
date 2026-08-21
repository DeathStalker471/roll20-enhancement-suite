# Roll20 Enhancement Suite - Interceptor Bridge (Manifest V3)

A lightweight helper extension designed to cooperate with the Tampermonkey userscript for Roll20 (Jumpgate & Legacy VTT).

---

## 🎯 Purpose

Modern browser security boundaries (Manifest V3 and Content Security Policies) prevent userscripts from directly cancelling network requests via `@webRequest` or executing inline dynamic bundles without CSP violations.

This helper extension solves this by:
1. **Blocking the original Roll20 VTT bundle** (`cdn.roll20.net/*vtt.bundle.*.js`) before it executes, preventing duplicate variable collisions (`campaign_id` / `d20` conflicts).
2. **Removing Content-Security-Policy (CSP) response headers** on `https://app.roll20.net/editor*`, allowing your Tampermonkey userscript to inject patched bundles and evaluate custom code.
3. **Exposing Bridge Health Indicators** (`window.__R20ES_BRIDGE_ACTIVE__ = true`) so the userscript can confirm the bridge is running.

---

## 🚀 How to Install

1. Open Google Chrome (or Brave / Edge / Chromium).
2. Navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left.
5. Select this `bridge` directory (`c:\Users\xligh\Documents\GitHub\roll20-enhancement-suite\bridge`).
6. Confirm the extension "Roll20 Enhancement Suite - Interceptor Bridge" appears with its status toggled ON.

---

## ⚙️ DeclarativeNetRequest Rules Explained (`rules.json`)

| Rule ID | Action | Target Pattern | Resource Types | Purpose |
|---|---|---|---|---|
| **1** | `block` | `||cdn.roll20.net/*vtt.bundle.*.js` | `script` | Blocks the native `<script>` tag from loading and running the unpatched VTT bundle. *(Note: `xmlhttprequest` / `fetch` are NOT blocked!)* |
| **2** | `modifyHeaders` | `||app.roll20.net/editor*` | `main_frame`, `sub_frame` | Strips `content-security-policy` and `content-security-policy-report-only` headers from the editor page. |
| **3-6** | `block` | Sentry / Datadog / UserLeap / GA | `script`, `xmlhttprequest` | Optional telemetry cancellation matching R20ES defaults. |

---

## 🛠️ Userscript Integration Pattern

In your Tampermonkey userscript:

```javascript
// ==UserScript==
// @name         Roll20 Jumpgate Patched Runner
// @namespace    https://justas-d.github.io/
// @version      1.0.0
// @match        https://app.roll20.net/editor*
// @run-at       document-start
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      cdn.roll20.net
// ==/UserScript==

(function() {
  'use strict';

  // 1. Verify Bridge is Active
  const checkBridge = () => {
    return window.__R20ES_BRIDGE_ACTIVE__ || document.documentElement.dataset.r20esBridge === "active";
  };

  // 2. Discover Bundle URL from DOM or default pattern
  function findBundleUrl() {
    // Check existing script tags in DOM
    const scripts = document.querySelectorAll("script[src*='vtt.bundle.']");
    for (const s of scripts) {
      if (s.src) return s.src;
    }
    // Alternatively fallback to standard production format if discovered early
    return null;
  }

  // 3. Fetch, Patch, and Inject
  function loadAndPatchBundle(bundleUrl) {
    console.log("[R20ES Userscript] Fetching original bundle from:", bundleUrl);
    
    GM.xmlHttpRequest({
      method: "GET",
      url: bundleUrl,
      onload: function(response) {
        let source = response.responseText;

        // Apply any R20ES hooks / module patches here:
        // source = applyPatches(source);

        console.log("[R20ES Userscript] Injecting patched bundle into DOM...");
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.textContent = source;
        (document.head || document.documentElement).appendChild(script);
      },
      onerror: function(err) {
        console.error("[R20ES Userscript] Failed to fetch bundle:", err);
      }
    });
  }

  // Observe script tag insertion if running at document-start
  const observer = new MutationObserver((mutations, obs) => {
    const url = findBundleUrl();
    if (url) {
      obs.disconnect();
      loadAndPatchBundle(url);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
```
