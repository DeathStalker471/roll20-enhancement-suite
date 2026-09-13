import { R20Module } from '../../utils/R20Module'
import { DOM } from '../../utils/DOM'
import { SheetTab } from '../../utils/SheetTab';
import { R20 } from "../../utils/R20";
import { promiseWait } from "../../utils/promiseWait";

const CHAR_ID_ATTRIBUTE = "data-characterid";
const ATTRIB_NAV_HAS_LISTENER = "data-r20es-character-sheet-nav-event";
const TAB_STYLE = "r20es-character-sheet-tab";
const ATTRIB_CUSTOM_NAV = "data-r20es-nav";

const ADVANCED_PANEL_CLASS = "r20es-asv-panel";
const ADVANCED_STYLE_ID = "r20es-asv-sheettab-style";
const ADVANCED_TAB_CLASS = "r20es-asv-tab";

const isAdvancedDialog = (dialog: HTMLElement | null): boolean => {
  return !!(dialog && dialog.classList && dialog.classList.contains("asv"));
};

const getDialogCharacterId = (dialog: HTMLElement): string | null => {
  return dialog.getAttribute(CHAR_ID_ATTRIBUTE)
    || dialog.getAttribute("data-characterId")
    || dialog.getAttribute("char-id");
};

const ensureAdvancedStyle = () => {
  if (document.getElementById(ADVANCED_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = ADVANCED_STYLE_ID;
  // Overlay panel only. Tab button chrome comes from cloning Roll20's own nav nodes.
  style.textContent = `
.${ADVANCED_PANEL_CLASS} {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  display: none;
  overflow: auto;
  background: var(--vtt-asv-window-bg, #fff);
  color: #333;
  padding: 12px 16px 20px;
  box-sizing: border-box;
  font-family: "Proxima Nova", "Nunito", Helvetica, Arial, sans-serif;
  font-size: 13px;
}

.${ADVANCED_PANEL_CLASS}.is-open {
  display: block;
}

.dark .${ADVANCED_PANEL_CLASS},
.asv.dark .${ADVANCED_PANEL_CLASS} {
  background: #1b1c1f;
  color: #f0f0f0;
}
`;
  document.head.appendChild(style);
};

class SheetTabApiModule extends R20Module.OnAppLoadBase {
  observer: MutationObserver;
  infectedNavs: Array<HTMLElement>;

  constructor() {
    super(__dirname);

    this.observerCallback = this.observerCallback.bind(this);
    this.try_injecting_single_widget = this.try_injecting_single_widget.bind(this);
    this.try_injecting_widget = this.try_injecting_widget.bind(this);
    this.navOnClick = this.navOnClick.bind(this);
    this.onClickNormalNavs = this.onClickNormalNavs.bind(this);
    this.rescan = this.rescan.bind(this);

    this.infectedNavs = [];
  }

  getWidgetTabRoots(navAElement) {
    return $(navAElement.parentNode.parentNode.parentNode).find("." + TAB_STYLE);
  }

  unselectSyntheticNavs(e) {
    const navTabsRoot = e.target.parentNode.parentNode;
    $(navTabsRoot).find("a[data-r20es-nav]").each((i, el) => {
      el.parentNode.classList.remove("active");
    });
  }

  onClickNormalNavs(e) {
    this.unselectSyntheticNavs(e);
    this.getWidgetTabRoots(e.target).each((i, obj) => {
      obj.style.display = "none";
    });
  }

  navOnClick(e) {
    const targetTabClass = e.target.getAttribute("data-tab");

    const internalTabs = SheetTab._getInternalData();
    const tab = internalTabs.tabsById[targetTabClass];
    if (!tab) return;

    const char_id = e.target.getAttribute(CHAR_ID_ATTRIBUTE);
    const tabInstance = tab.getInstanceData(char_id);

    if(tab && tab.onShow) {
      tab.onShow(tabInstance);
    }

    this.unselectSyntheticNavs(e);
    e.target.parentNode.classList.add("active");

    this.getWidgetTabRoots(e.target).each((i, obj) => {
      obj.style.display = obj.classList.contains(targetTabClass)
        ? "block"
        : "none";
    });
  }

  try_injecting_widget(target) {
    const data = SheetTab._getInternalData();

    for (const tab of data.tabs) {
      this.try_injecting_single_widget(target, tab);
    }
  }

  hideAdvancedPanels(dialog: HTMLElement) {
    dialog.querySelectorAll(`:scope > .${ADVANCED_PANEL_CLASS}`).forEach((el) => {
      el.classList.remove("is-open");
    });
    dialog.querySelectorAll(`:scope > .${ADVANCED_PANEL_CLASS} > .${TAB_STYLE}`).forEach((el: HTMLElement) => {
      el.style.display = "none";
    });
    dialog.querySelectorAll(`.asv__header__nav__tabs > li.${ADVANCED_TAB_CLASS}`).forEach((el) => {
      el.classList.remove("active");
    });
  }

  positionAdvancedPanel(dialog: HTMLElement, panel: HTMLElement) {
    const header = dialog.querySelector(".asv__header") as HTMLElement;
    const top = header ? header.offsetHeight : 88;
    panel.style.top = `${top}px`;
  }

  injectAdvancedHostWidget(dialog: HTMLElement, characterId: string, tab) {
    const ul = dialog.querySelector(".asv__header__nav__tabs") as HTMLElement;
    if (!ul) return false;

    if (ul.querySelector(`li.${ADVANCED_TAB_CLASS} [data-tab="${tab.id}"]`)) {
      return false;
    }

    // Prefer a real Roll20 tab so scoped data-v-* styles apply without reimplementation.
    const sampleLi = ul.querySelector(`li:not(.${ADVANCED_TAB_CLASS})`) as HTMLElement;
    if (!sampleLi) return false;

    ensureAdvancedStyle();

    if (getComputedStyle(dialog).position === "static") {
      dialog.style.position = "relative";
    }

    const li = sampleLi.cloneNode(true) as HTMLElement;
    li.classList.remove("active");
    li.classList.add(ADVANCED_TAB_CLASS);

    const btn = li.querySelector("button, a") as HTMLElement;
    if (!btn) return false;

    const tabInstanceData = tab.getInstanceData(characterId);
    const renderFxResult = tab.renderFx(tabInstanceData);

    let panelRoot = dialog.querySelector(`:scope > .${ADVANCED_PANEL_CLASS}`) as HTMLElement;
    if (!panelRoot) {
      panelRoot = document.createElement("div");
      panelRoot.className = ADVANCED_PANEL_CLASS;
      panelRoot.setAttribute("data-r20es-asv-panel", characterId);
      dialog.appendChild(panelRoot);

      // Clicks on Roll20's own header/nav collapse our overlay.
      dialog.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target) return;
        if (panelRoot.contains(target)) return;
        if (target.closest && target.closest(`li.${ADVANCED_TAB_CLASS}`)) return;
        this.hideAdvancedPanels(dialog);
      }, true);
    }

    let tabPanel = panelRoot.querySelector(`:scope > .${TAB_STYLE}.${tab.id}`) as HTMLElement;
    if (!tabPanel) {
      tabPanel = document.createElement("div");
      tabPanel.className = `${TAB_STYLE} ${tab.id}`;
      tabPanel.style.display = "none";
      tabPanel.style.minHeight = "100%";
      panelRoot.appendChild(tabPanel);
    }

    tabInstanceData.contentRoot = panelRoot;
    tabInstanceData.root = renderFxResult;
    tabPanel.appendChild(renderFxResult);
    tab._addElem(tabPanel);

    btn.setAttribute("data-tab", tab.id);
    btn.setAttribute(CHAR_ID_ATTRIBUTE, characterId);
    btn.setAttribute(ATTRIB_CUSTOM_NAV, "true");
    btn.textContent = tab.name;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = li.classList.contains("active");
      this.hideAdvancedPanels(dialog);

      if (isOpen) {
        this.positionAdvancedPanel(dialog, panelRoot);
        return;
      }

      // Deactivate Roll20 tabs visually so ours reads as selected.
      ul.querySelectorAll("li").forEach((el) => el.classList.remove("active"));

      if (tab.onShow) {
        tab.onShow(tabInstanceData);
      }

      panelRoot.querySelectorAll(`:scope > .${TAB_STYLE}`).forEach((el: HTMLElement) => {
        el.style.display = "none";
      });

      li.classList.add("active");
      this.positionAdvancedPanel(dialog, panelRoot);
      panelRoot.classList.add("is-open");
      tabPanel.style.display = "block";

      if (tabInstanceData.rerender) {
        try { tabInstanceData.rerender(); } catch (err) { console.error(err); }
      }
    });

    ul.appendChild(li);
    tab._addElem(li);

    return true;
  }

  tryInjectAllAdvanced(dialog: HTMLElement) {
    if (!isAdvancedDialog(dialog)) return;

    const characterId = getDialogCharacterId(dialog);
    if (!characterId) return;

    const data = SheetTab._getInternalData();
    for (const tab of data.tabs) {
      if (tab.predicate) {
        const char = R20.getCharacter(characterId);
        if (!tab.predicate(char)) continue;
      }
      this.injectAdvancedHostWidget(dialog, characterId, tab);
    }
  }

  async try_injecting_single_widget(iframe, tab) {
    if(!iframe) return false;
    if(iframe.nodeName != "IFRAME") return false;

    const character_dialog = iframe.parentNode;
    if(!character_dialog) return false
    if(!character_dialog.classList.contains("characterdialog")) return false;

    // Advanced sheets are handled only via tryInjectAllAdvanced.
    if(isAdvancedDialog(character_dialog)) return false;

    const characterId = character_dialog.getAttribute(CHAR_ID_ATTRIBUTE);

    if(tab.predicate) {
      const char = R20.getCharacter(characterId);
      if(!tab.predicate(char)) {
        return;
      }
    }

    const wait_for_load = new Promise(ok => {
      try {
        if(iframe.contentDocument && iframe.contentDocument.readyState == "complete") {
          ok();
          return;
        }
      } catch (e) {
        ok();
        return;
      }

      const listener = () => {
        iframe.removeEventListener("load", listener);
        ok();
      }

      iframe.addEventListener("load", listener);
    });

    await wait_for_load;

    let navTabsRoot = null;
    let body = null;

    const retry = new Promise(ok => {
      let attempts = 0;
      const retry_interval = 200;
      const check = () => {
        attempts++;
        try {
          if(iframe.contentDocument) {
            body = iframe.contentDocument.body;
            if(body) {
              const dialog = body.querySelector("#dialog-window");
              if(dialog) {
                navTabsRoot = dialog.querySelector(".nav-tabs");
                if(navTabsRoot) {
                  ok();
                  return;
                }
              }
            }
          }
        } catch (e) {
          // Cross origin iframe (e.g. Beacon sheet), cannot access DOM
          ok();
          return;
        }

        if (attempts >= 10) {
          ok();
          return;
        }

        setTimeout(check, retry_interval);
      };

      setTimeout(check, retry_interval);
    });

    const timeout = promiseWait(2500);

    await Promise.race([retry, timeout]);

    if(navTabsRoot) {

      {
        const query_string = `[data-tab=${tab.id}]`
        const query = navTabsRoot.querySelector(query_string);
        if(query) {
          return false;
        }
      }

      const nav = (
        <li>
          <a
            onClick={this.navOnClick}
            data-tab={tab.id}
            href="javascript:void(0);"
            data-characterid={characterId}
          >
            {tab.name}
          </a>
        </li>
      );

      nav.firstElementChild.setAttribute(ATTRIB_CUSTOM_NAV, true);

      tab._addElem(nav);

      navTabsRoot.appendChild(nav);

      // register an event handler on the normal navbar tabs
      // onClickNormalNavs will hide the custom stuff, state active state for the custom nav
      $(navTabsRoot).find("a[data-tab]").each((i, el) => {
        if (el.hasAttribute(ATTRIB_CUSTOM_NAV)) return;
        if (el.hasAttribute(ATTRIB_NAV_HAS_LISTENER)) return;

        el.setAttribute(ATTRIB_NAV_HAS_LISTENER, true);
        el.addEventListener("click", this.onClickNormalNavs);
        this.infectedNavs.push(el);
      });

      const tabInstanceData = tab.getInstanceData(characterId);

      const renderFxResult = tab.renderFx(tabInstanceData);

      const tabroot = body.querySelector(".tab-content");
      tabInstanceData.contentRoot = tabroot;
      tabInstanceData.root = renderFxResult;

      const widget = (
        <div className={[TAB_STYLE, tab.id, "tab-pane"]} style={{ display: "none" }}>
          {renderFxResult}
        </div>
      );

      tab._addElem(widget);
      tabroot.appendChild(widget);
    }
    else {
      console.error("SheetTab: Could not find navTabsRoot :(");
    }

    return true;
  }

  observerCallback(muts) {
    for (var e of muts) {
      for (const added of e.addedNodes) {
        if (!added || added.nodeType !== 1) continue;

        const el = added as HTMLElement;
        if (el.classList && el.classList.contains("characterdialog") && el.classList.contains("asv")) {
          this.tryInjectAllAdvanced(el);
        } else if (el.querySelectorAll) {
          el.querySelectorAll(".characterdialog.asv").forEach((d) => {
            this.tryInjectAllAdvanced(d as HTMLElement);
          });
        }

        this.try_injecting_widget(added);
      }

      if(e.target && (e.target as HTMLElement).nodeName === "IFRAME") {
        this.try_injecting_widget(e.target);
      }
    }
  }

  rescan(tab) {
    const existingHeaders = document.querySelectorAll("iframe");
    existingHeaders.forEach(header => {
      this.try_injecting_single_widget(header, tab);
    });

    document.querySelectorAll(".characterdialog.asv").forEach((dialog) => {
      this.tryInjectAllAdvanced(dialog as HTMLElement);
    });
  }

  setup() {
    this.observer = new MutationObserver(this.observerCallback);
    this.observer.observe(document.body, { childList: true, subtree: true });

    {
      const existingHeaders = document.querySelectorAll("iframe");
      existingHeaders.forEach(header => {
        this.try_injecting_widget(header);
      });

      document.querySelectorAll(".characterdialog.asv").forEach((dialog) => {
        this.tryInjectAllAdvanced(dialog as HTMLElement);
      });
    }

    SheetTab._getInternalData().rescanFunc = this.rescan;
  }

  dispose() {
    SheetTab._getInternalData().rescanFunc = null;

    const data = SheetTab._getInternalData();
    for(const tab of data.tabs) {
      tab.dispose();
    }
    data.tabs = [];

    for(const el of this.infectedNavs) {
      el.removeEventListener("click", this.onClickNormalNavs);
      el.removeAttribute(ATTRIB_NAV_HAS_LISTENER);
    }

    this.infectedNavs.length = 0;

    document.querySelectorAll(`li.${ADVANCED_TAB_CLASS}, .${ADVANCED_PANEL_CLASS}`).forEach(el => el.remove());
    const style = document.getElementById(ADVANCED_STYLE_ID);
    if (style) style.remove();

    if (this.observer) this.observer.disconnect();
  }
}

export default () => {
  new SheetTabApiModule().install();
};
