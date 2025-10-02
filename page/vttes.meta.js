// ==UserScript==
// @name         Death Stalker Jumpgate VTT Enhancement Suite
// @namespace    https://justas-d.github.io/
// @version      1.28.26.3
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
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      cdn.roll20.net
// @webRequest [{"selector":{"include":"*://browser.sentry-cdn.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://www.datadoghq-browser-agent.com/datadog-rum.js"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://cdn.userleap.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://www.google-analytics.com/*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?*","exclude":"*://app.roll20.net/js/jquery-ui.1.9.0.custom.min.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/jquery-1.9.1.js","exclude":"*://app.roll20.net/v2/js/jquery-1.9.1.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/jquery.migrate.js","exclude":"*://app.roll20.net/v2/js/jquery.migrate.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/featuredetect.js?2","exclude":"*://app.roll20.net/js/featuredetect.js?2n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/v2/js/patience.js","exclude":"*://app.roll20.net/v2/js/patience.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/editor/startjs/?timestamp*","exclude":"*://app.roll20.net/editor/startjs/?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/d20/loading.js?v=11","exclude":"*://app.roll20.net/js/d20/loading.js?n=11&v=11"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://cdn.roll20.net/vtt/jumpgate/production/20250930/vtt.bundle.*.js","exclude":"*://cdn.roll20.net/vtt/jumpgate/production/20250930/vtt.bundle.*.js?n*"},"action":"cancel"}]
// @webRequest [{"selector":{"include":"*://app.roll20.net/js/tutorial_tips.js","exclude":"*://app.roll20.net/js/tutorial_tips.js?n*"},"action":"cancel"}]
// ==/UserScript==
