// Roll20 Enhancement Suite - Bridge Content Script
// Runs in MAIN world at document_start to establish bridge flags directly on window

(function() {
  'use strict';

  try {
    window.__R20ES_BRIDGE_ACTIVE__ = true;
    window.__R20ES_BRIDGE_VERSION__ = "1.0.0";
    window.__R20ES_BRIDGE_TIMESTAMP__ = Date.now();
    document.documentElement.dataset.r20esBridge = "active";
    document.documentElement.dataset.r20esBridgeVersion = "1.0.0";

    window.dispatchEvent(new CustomEvent("R20ES_BRIDGE_READY", {
      detail: { version: "1.0.0", active: true }
    }));

    console.log("%c[R20ES Bridge]%c Active & CSP stripped", "color: #ff3366; font-weight: bold;", "color: #00ff88;");
  } catch (e) {
    console.error("[R20ES Bridge] Initialization error:", e);
  }
})();
