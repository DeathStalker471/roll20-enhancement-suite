// AutoPingNextTokenModule.ts (Simplified & Cleaned)

import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class AutoPingNextTokenModule extends R20Module.SimpleBase {
  // We still need to store the original function so we can restore it later.
  private static originalNextTurn: (() => void) | null = null;

  public constructor() {
    super(__dirname);
  }

  // The core ping logic, now without debug logs.
  private static ping(tokenId: string) {
    if (!tokenId || tokenId === "-1") {
      return; 
    }
    const tokenObject = R20.getCurrentPageTokenByUUID(tokenId);
    if (!tokenObject) {
      return;
    }
    const model = R20.try_get_canvas_object_model(tokenObject);
    if (!model) {
      return;
    }
    if (model.get("layer") !== "objects") {
      return;
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
      console.error("AutoPingNextTokenModule failed to handle turn change:", e);
    }
  };

  public setup() {
    if (!R20.isGM()) return;

    // We use a minimal setTimeout to ensure our patch applies after the VTT's own setup is complete.
    // This is much cleaner than an interval.
    setTimeout(() => {
        const initiativeWindow = R20.getInitiativeWindow();

        // Safety check to ensure the initiative window and its function exist before we patch them.
        if (!initiativeWindow || typeof initiativeWindow.nextTurn !== 'function') {
            console.error("AutoPingNextTokenModule Error: Could not find the initiative window's nextTurn function to patch.");
            return;
        }

        // Store the original function if it hasn't been stored already.
        if (!AutoPingNextTokenModule.originalNextTurn) {
            AutoPingNextTokenModule.originalNextTurn = initiativeWindow.nextTurn;
        }

        initiativeWindow.nextTurn = (...args: any[]) => {
            this.handleTurnChange();

            return AutoPingNextTokenModule.originalNextTurn.apply(initiativeWindow, args);
        };
    }, 0); 
  }

  public dispose() {
    if (AutoPingNextTokenModule.originalNextTurn) {
      const initiativeWindow = R20.getInitiativeWindow();
      if (initiativeWindow) {
        initiativeWindow.nextTurn = AutoPingNextTokenModule.originalNextTurn;
      }
      AutoPingNextTokenModule.originalNextTurn = null;
    }
  }
}

export default () => {
  new AutoPingNextTokenModule().install();
};