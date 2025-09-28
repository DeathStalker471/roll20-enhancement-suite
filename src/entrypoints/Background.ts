import { VTTES_MODULE_CONFIGS } from '../Configs'
import {getBrowser, replaceAll} from '../utils/MiscUtils';
import {doesBrowserNotSupportResponseFiltering} from "../utils/BrowserDetection";
import { apply_mods_to_text } from "../HookUtils";
import {replace_all_and_count} from "../utils/MiscUtils";

if(doesBrowserNotSupportResponseFiltering()) {

  // Manifest V3 Implementation for Chrome

  // Define the declarativeNetRequest rules based on the original webRequest blocking logic.
  // We use regex filters for the complex "cancel if ?n is NOT present" logic.
  const DECLARATIVE_NET_REQUEST_RULES = [
    // Block Analytics/Telemetry
    {
      "id": 1,
      "priority": 1,
      "action": { "type": "block" },
      "condition": { "urlFilter": "cdn.userleap.com", "resourceTypes": ["script"] }
    },
    {
      "id": 2,
      "priority": 1,
      "action": { "type": "block" },
      "condition": { "urlFilter": "google-analytics.com", "resourceTypes": ["script"] }
    },

    // Block specific Roll20 scripts unless they have the expected query string (e.g., '?n')

    // 3. jquery-ui.1.9.0.custom.min.js
    // Regex: Matches the URL followed by '?' but NOT by '?n' (case-insensitive, non-greedy match).
    {
      "id": 3,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/js/jquery-ui\\.1\\.9\\.0\\.custom\\.min\\.js\\?(?!n).*$",
        "resourceTypes": ["script"]
      }
    },
    // 4. jquery-1.9.1.js
    {
      "id": 4,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/v2/js/jquery-1\\.9\\.1\\.js(?!\\?n).*$",
        "resourceTypes": ["script"]
      }
    },
    // 5. jquery.migrate.js
    {
      "id": 5,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/v2/js/jquery\\.migrate\\.js(?!\\?n).*$",
        "resourceTypes": ["script"]
      }
    },
    // 6. featuredetect.js?2
    {
      "id": 6,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/js/featuredetect\\.js\\?2(?!n).*$",
        "resourceTypes": ["script"]
      }
    },
    // 7. patience.js
    {
      "id": 7,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/v2/js/patience\\.js(?!\\?n).*$",
        "resourceTypes": ["script"]
      }
    },
    // 8. editor/startjs/?timestamp (Always canceled in original logic)
    {
      "id": 8,
      "priority": 1,
      "action": { "type": "block" },
      // Exact match on the base URL, assuming the user doesn't call it without '?timestamp'
      "condition": {
        "urlFilter": "app.roll20.net/editor/startjs",
        "resourceTypes": ["script"]
      }
    },
    // 9. loading.js?v=11
    {
      "id": 9,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/js/d20/loading\\.js\\?v=11(?!.*n=11).*$",
        "resourceTypes": ["script"]
      }
    },
    // 10. tutorial_tips.js
    {
      "id": 10,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://app\\.roll20\\.net/js/tutorial_tips\\.js(?!\\?n).*$",
        "resourceTypes": ["script"]
      }
    },
    // 11. vtt.bundle
    {
      "id": 11,
      "priority": 1,
      "action": { "type": "block" },
      "condition": {
        "regexFilter": "^https://cdn\\.roll20\\.net/vtt/jumpgate/production/latest/vtt\\.bundle(?!\\?n).*$",
        "resourceTypes": ["script"]
      }
    },
  ];

  // Install the declarativeNetRequest rules when the extension is installed/updated.
  // This replaces the old webRequest.onBeforeRequest.addListener for blocking.
  if (typeof chrome.declarativeNetRequest !== 'undefined') {
    (async function install_declarative_rules() {
      // Get the current list of dynamic rules to avoid collisions, then update.
      const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
      const ruleIdsToRemove = currentRules.map(r => r.id).filter(id => id <= 11);

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove,
        addRules: DECLARATIVE_NET_REQUEST_RULES
      });
      console.log("VTTES: Installed declarativeNetRequest rules for Manifest V3");
    })();
  }
  
  // @ChromeScriptFetching
  // This runtime.onMessage listener remains, as service workers still listen for messages.
  getBrowser().runtime.onMessage.addListener((request, sender, send_response) => {
    if(request.VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND) {

      var bundle_url = request.VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND;

      (async function () {
        console.log("got VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND");

        // NOTE: In MV3 Service Worker, fetch is fully supported.
        const req = await fetch(`${bundle_url}?n${Date.now()}`);
        const text = await req.text();

        const results = {
          VTT_BUNDLE: text,
        };

        console.log("VTTES_WANTS_CDN_SCRIPTS_FROM_BACKGROUND results:", results);

        send_response(results);
      })();

      return true;
    }

    return false;
  });

  // The V2 webRequest blocking logic is entirely replaced by declarativeNetRequest above.
}
else {
  // Manifest V2 / Firefox Implementation (Response Filtering)
  const redirect_targets = [
    "https://app.roll20.net/editor/startjs",
    "https://cdn.roll20.net/vtt/jumpgate/production/latest/vtt.bundle",
  ];

  // thanks, Firefox.
  const request_listener = (request) => {

    const is_redir = typeof(redirect_targets.find(f => request.url.startsWith(f))) !== "undefined";
    //console.log(`${is_redir}: ${request.url}`);

    if(!is_redir) {
      return;
    }

    const filter = getBrowser().webRequest.filterResponseData(request.requestId);
    const decoder = new TextDecoder("utf-8");

    let string_buffer = "";

    filter.ondata = e => {
      string_buffer += decoder.decode(e.data, {stream: true});
    };

    filter.onstop = e => {
      // This is the content modification logic
      const hooked_data = apply_mods_to_text(string_buffer, request.url, VTTES_MODULE_CONFIGS);

      filter.write(new TextEncoder().encode(hooked_data));
      filter.close();
    };
  };

  // This listener is for content modification, not blocking, and uses 'blocking' 
  // only to allow filterResponseData to work.
  getBrowser().webRequest.onBeforeRequest.addListener(
    request_listener,
    {urls: [
      "*://app.roll20.net/*",
      "*://cdn.roll20.net/*"
    ]},
    ["blocking"]
  );
  
  // The V2 blocking logic is NOT needed in this path because the Content Scripts 
  // and the content modification above handle the script injection/replacement.
}

console.log("window.r20es Background hook script initialized");