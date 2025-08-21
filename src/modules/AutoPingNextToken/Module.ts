import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
  private static originalNextTurn: (() => void) | null = null;
  private patchInterval: number | null = null;

  public constructor() {
    super(__dirname);
  }

  private static ping(tokenId: string) {
    if (!tokenId || tokenId === "-1") {
      return; // Silently ignore custom items in turn order
    }
    const tokenObject = R20.getCurrentPageTokenByUUID(tokenId);
    if (!tokenObject) {
      return; // Silently ignore if token isn't on the current page
    }
    const model = R20.try_get_canvas_object_model(tokenObject);
    if (!model) {
      return;
    }
    if (model.get("layer") !== "objects") {
      return; // Only ping tokens on the player token layer
    }
    R20.ping(tokenObject.left, tokenObject.top);
  }

  private handleTurnChange = () => {
    try {
      const turnOrder = R20.getInitiativeData();
      if (turnOrder && turnOrder.length > 0) {
        AutoPingNextTokenModule.ping(turnOrder[0].id);
      }
    } catch (e) {
      // It's good practice to keep a single error log for unexpected failures.
      console.error("AutoPingNextTokenModule failed while handling turn change:", e);
    }
  };

  private tryApplyPatch = () => {
    if (typeof window.Campaign === 'undefined' || !window.Campaign) {
      return; // Wait for Campaign object to be ready
    }

    const initiativeWindow = R20.getInitiativeWindow();
    
    if (initiativeWindow && typeof initiativeWindow.nextTurn === 'function') {
      if (this.patchInterval) {
        clearInterval(this.patchInterval);
        this.patchInterval = null;
      }
      
      if (!AutoPingNextTokenModule.originalNextTurn) {
        AutoPingNextTokenModule.originalNextTurn = initiativeWindow.nextTurn;
      }
      
      initiativeWindow.nextTurn = (...args: any[]) => {
        // Call the original function first to advance the turn.
        const result = AutoPingNextTokenModule.originalNextTurn.apply(initiativeWindow, args);
        // Then, call our logic to ping the new current token.
        this.handleTurnChange();
        return result;
      };
    }
  };

  public setup() {
    if (!R20.isGM()) return;
    this.patchInterval = setInterval(this.tryApplyPatch, 500);
  }

  public dispose() {
    if (AutoPingNextTokenModule.originalNextTurn) {
      const initiativeWindow = R20.getInitiativeWindow();
      if (initiativeWindow) {
        initiativeWindow.nextTurn = AutoPingNextTokenModule.originalNextTurn;
      }
      AutoPingNextTokenModule.originalNextTurn = null;
    }

    if (this.patchInterval) {
      clearInterval(this.patchInterval);
      this.patchInterval = null;
    }
  }
}

export default () => {
  new AutoPingNextTokenModule().install();
};