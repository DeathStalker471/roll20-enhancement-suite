const fs = require('fs');
const shell = require('shelljs');

const assert = (expr, msg) => {
  if(expr) return;
  console.error(msg);
  process.exit(1);
};

let is_prod = true;
if(process.argv[2] === "development") {
  is_prod = false;
}
else if(process.argv[2] === "production") {
  is_prod = true;
}
else {
  assert(false, "Please specify if the userscript is a 'development' or 'production' script");
}

const no_fail = (script) => {
  const result = shell.exec(script);
  if(result.code != 0) {
    process.exit(result.code);
  }
};

const changelogFile = "changelog.json";
if(!fs.existsSync(changelogFile)) {
  console.log(`couldn't find ${changelogFile}`);
  process.exit(1);
}
const changelog_str = fs.readFileSync(changelogFile, "utf8");
const changelog = JSON.parse(changelog_str);
assert(changelog.current != "TODO");

const can_fail = shell.exec;
let path_to_script = "";
let path_to_meta = "";

if(is_prod) {
  no_fail("webpack --mode production --display-error-details --progress --colors --config ./webpack.config.userscript.js");
  path_to_script = "builds/userscript/prod/vttes.user.js";
  path_to_meta = "builds/userscript/prod/vttes.meta.js";
}
else {
  no_fail("webpack --mode development --display-error-details --progress --colors --config ./webpack.config.userscript.js");
  path_to_script = "builds/userscript/dev/vttes.user.js";
  path_to_meta = "builds/userscript/dev/vttes.meta.js";
}

let script = fs.readFileSync(path_to_script, "utf8");

const meta = `// ==UserScript==
// @name         Death Stalker Jumpgate VTT Enhancement Suite
// @namespace    https://justas-d.github.io/
// @version      ${changelog.current}
// @description  aka R20ES. Provides quality-of-life and workflow speed improvements to Roll20.
// @author       @Justas_Dabrila/DeathStalkerjr
// @updateURL    https://raw.githubusercontent.com/DeathStalker471/roll20-enhancement-suite/refs/heads/master/page/vttes.meta.js
// @downloadURL  https://raw.githubusercontent.com/DeathStalker471/roll20-enhancement-suite/refs/heads/master/page/vttes.user.js
// @match        https://app.roll20.net/editor
// @match        https://app.roll20.net/editor#*
// @match        https://app.roll20.net/editor?*
// @match        https://app.roll20.net/editor/
// @match        https://app.roll20.net/editor/#*
// @match        https://app.roll20.net/editor/?*
// @run-at       document-start
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      cdn.roll20.net
// @webRequest   [{"selector": "*://cdn.roll20.net/*vtt.bundle*", "action": "cancel"}]
// @webRequest   [{"selector": "*://app.roll20.net/editor/startjs/?timestamp*", "action": "cancel"}]
// @webRequest   [{"selector": "*://browser.sentry-cdn.com/*", "action": "cancel"}]
// @webRequest   [{"selector": "*://datadoghq-browser-agent.com/*", "action": "cancel"}]
// @webRequest   [{"selector": "*://cdn.userleap.com/*", "action": "cancel"}]
// @webRequest   [{"selector": "*://google-analytics.com/*", "action": "cancel"}]
// ==/UserScript==
`;

script = `
(function() {
  'use strict';

  unsafeWindow.enhancementSuiteEnabled = true;
  const now = Date.now();
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  const isBridgeActive = !!(unsafeWindow.__R20ES_BRIDGE_ACTIVE__ || (document.documentElement && document.documentElement.dataset && document.documentElement.dataset.r20esBridge));

  console.log(\`[R20ES] Platform: \${isFirefox ? "Firefox" : "Chromium"}, Bridge Active: \${isBridgeActive}\`);

  function findBundleUrl() {
    const scripts = Array.from(document.querySelectorAll("script"));
    for(const el of scripts) {
      if(el.src && el.src.includes("cdn.roll20.net") && el.src.includes("vtt.bundle")) {
        return el.src;
      }
    }
    return null;
  }

  function startUserscript(bundle_url) {
    console.log(\`[R20ES] Discovered bundle url: \${bundle_url}\`);
    unsafeWindow.USERSCRIPT_VTT_BUNDLE_URL = bundle_url;

    // @UserscriptScriptFetching
    GM.xmlHttpRequest({
      method: "GET",
      url: \`\${bundle_url}?n\${now}\`,
      onload: (response) => {
        console.log("[R20ES] Userscript got vtt.bundle.js response");
        unsafeWindow.USERSCRIPT_VTT_BUNDLE_DATA = response.responseText;
      },
      onerror: (err) => {
        console.error("[R20ES] Failed to fetch bundle:", err);
      }
    });

    function boot() {
${script}
    };
    const str = \`(\${boot.toString()})()\`;
    window.eval(str);
  }

  let bundle_url = findBundleUrl();
  if(bundle_url) {
    startUserscript(bundle_url);
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      bundle_url = findBundleUrl();
      if(bundle_url) {
        clearInterval(interval);
        startUserscript(bundle_url);
      } else if(attempts >= 300) {
        clearInterval(interval);
        alert("VTTES Error: Failed to find the bundle URL. VTTES will not function. Please report this on our Discord");
      }
    }, 10);
  }
})();
`;

if(is_prod) {
  script = `${meta}
${script}
`;
}

fs.writeFileSync(path_to_script, script);
fs.writeFileSync(path_to_meta, meta);

if (is_prod) {
  if (fs.existsSync("page")) {
    fs.writeFileSync("page/vttes.user.js", script);
    fs.writeFileSync("page/vttes.meta.js", meta);
  }
}

/*
For development, use this loader script:

// ==UserScript==
// @name         Loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://app.roll20.net/editor*
// @run-at       document-start
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      cdn.roll20.net
// @require      file:///c:/Users/xligh/Documents/GitHub/roll20-enhancement-suite/builds/userscript/dev/vttes.user.js
// ==/UserScript==

Change the @require path to the dev vttes.user.js
*/
