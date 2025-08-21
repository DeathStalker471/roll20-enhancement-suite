import { R20Module } from "../../utils/R20Module";
import { R20 } from "../../utils/R20";

class AutoSelectNextTokenModule extends R20Module.SimpleBase {
    private static originalNextTurn: (() => void) | null = null;
    private patchInterval: number | null = null;

    constructor() {
        super(__dirname);
    }

    private static selectTokenForTurn(tokenId: string) {
        if (!tokenId || tokenId === "-1") {
            R20.unselectTokens();
            return;
        }

        const tokenObject = R20.getCurrentPageTokenByUUID(tokenId);

        if (tokenObject) {
            R20.selectToken(tokenObject);
        } else {
            R20.unselectTokens();
        }
    }

    private handleTurnChange = () => {
        try {
            const turnOrder = R20.getInitiativeData();
            if (turnOrder && turnOrder.length > 0) {
                AutoSelectNextTokenModule.selectTokenForTurn(turnOrder[0].id);
            } else {
                R20.unselectTokens();
            }
        } catch (e) {
            console.error("AutoSelectNextTokenModule failed while handling turn change:", e);
        }
    };

    private tryApplyPatch = () => {
        if (typeof window.Campaign === 'undefined' || !window.Campaign) {
            return;
        }

        const initiativeWindow = R20.getInitiativeWindow();
        
        if (initiativeWindow && typeof initiativeWindow.nextTurn === 'function') {
            if (this.patchInterval) {
                clearInterval(this.patchInterval);
                this.patchInterval = null;
            }
            
            if (!AutoSelectNextTokenModule.originalNextTurn) {
                AutoSelectNextTokenModule.originalNextTurn = initiativeWindow.nextTurn;
            }
            
            initiativeWindow.nextTurn = (...args: any[]) => {
                const result = AutoSelectNextTokenModule.originalNextTurn.apply(initiativeWindow, args);
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
        if (AutoSelectNextTokenModule.originalNextTurn) {
            const initiativeWindow = R20.getInitiativeWindow();
            if (initiativeWindow) {
                initiativeWindow.nextTurn = AutoSelectNextTokenModule.originalNextTurn;
            }
            AutoSelectNextTokenModule.originalNextTurn = null;
        }

        if (this.patchInterval) {
            clearInterval(this.patchInterval);
            this.patchInterval = null;
        }
    }
}

export default () => {
  new AutoSelectNextTokenModule().install();
};