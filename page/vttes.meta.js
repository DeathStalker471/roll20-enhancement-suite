// ==UserScript==
// @name         Death Stalker Jumpgate VTT Enhancement Suite
// @namespace    https://justas-d.github.io/
// @version      1.28.29.3
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
