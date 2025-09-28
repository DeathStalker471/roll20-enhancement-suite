// Import a utility function that finds an HTML element by its ID and removes it from the document.
import { findByIdAndRemove } from "./MiscUtils";
// Imports a utility type, likely from a TypeScript utility file.
// `Optional<T>` is probably defined as `T | undefined`, making it clear that a parameter may be omitted.
import {Optional} from "./TypescriptUtils";

// Define a constant for the key under which the context menu data will be stored globally.
// This avoids using "magic strings" and makes the code easier to maintain.
const TOKEN_CONTEXT_MENU_GLOBAL_KEY = "tokenContextMenu";

/**
 * Defines the optional configuration for a context menu button.
 * This allows for conditional display of the button.
 */
export interface ITokenContextMenuButtonOptions {
    // If true, the button will only be shown if one or more tokens are currently selected on the canvas.
    mustHaveSelection?: boolean;
    // If true, the button will only be shown if no tokens are currently selected.
    cannotHaveSelection?: boolean;
}

/**
 * Defines the structure for a single custom button object.
 * This interface represents all the necessary information to create and manage a button.
 */
export interface ITokenContextMenuButton {
    id: string; // A unique HTML ID for the button element for easy DOM manipulation.
    text: string; // The visible text that will appear on the button.
    callback: Function; // The function to execute when the button is clicked.
    options?: ITokenContextMenuButtonOptions; // Optional display rules, as defined above.
}

/**
 * Defines the structure of the internal data store that holds all context menu information.
 * This is the object that will be stored globally.
 */
interface InternalData {
    // A dictionary (or map) where keys are numbers (for ordering) and values are the button objects.
    widgets: {[id:string] : ITokenContextMenuButton};
    // A counter to ensure that every new button gets a unique ID.
    idTop: number;
}

/**
 * A static class that acts as a manager for custom token context menu buttons.
 * It provides methods to add, remove, and retrieve button data from a global store.
 */
export class TokenContextMenu {

    /**
     * A static method to retrieve (or initialize) the global data store for the context menu.
     * This pattern ensures that there is only one central source of truth for all custom buttons.
     * @returns The singleton `InternalData` object.
     */
    static getInternalData = (): InternalData => {
        // `window.r20es` is likely a custom global namespace for the entire script suite to avoid polluting the global `window` object.
        // This checks if the `tokenContextMenu` data store has been initialized yet.
        if (!("tokenContextMenu" in window.r20es)) {

            // If it hasn't been initialized, create a new data structure.
            const newData: InternalData = {
                widgets: {}, // Start with an empty collection of widgets.
                idTop: 0,    // Start the ID counter at 0.
            };

            // Attach the newly created data store to the global namespace.
            window.r20es[TOKEN_CONTEXT_MENU_GLOBAL_KEY] = newData;
        }

        // Return the existing or newly created data store.
        return window.r20es[TOKEN_CONTEXT_MENU_GLOBAL_KEY];
    };

    /**
     * Registers a new button to be added to the context menu.
     * @param text The text to display on the button.
     * @param callback The function to run when the button is clicked.
     * @param order A number used as a key to store the button, which can influence its position.
     * @param _options Optional display conditions for the button.
     */
    static addButton = (text: string, callback: Function, order: number, _options: Optional<ITokenContextMenuButtonOptions> = undefined) => {

        // Get the central data store.
        const data = TokenContextMenu.getInternalData();
        // Generate a unique ID for the new button by using the idTop counter and then incrementing it.
        const id = `r20es-token-ctx-menu-button-${data.idTop++}`;

        // Create the button payload object, conforming to the ITokenContextMenuButton interface.
        const payload: ITokenContextMenuButton = {
            id,
            text,
            callback,
            options: _options
        };

        // Add the new button object to the `widgets` dictionary, using the `order` parameter as its key.
        data.widgets[order] = payload;
    };

    /**
     * Finds and removes a previously added button.
     * @param text The text of the button to remove.
     * @param callback The callback function of the button to remove.
     * @returns `true` if a matching button was found and removed, `false` otherwise.
     */
    static removeButton = (text: string, callback: Function) => {
        // Get all the currently registered widgets.
        const all = TokenContextMenu.getInternalData().widgets;

        // Iterate over all the keys in the widgets dictionary.
        for(const key in all) {
            const cur = all[key];

            // Check if the current widget matches both the text and the callback function.
            // Matching by both is important to avoid accidentally removing the wrong button if two have the same text.
            if (cur.text === text && cur.callback === callback) {
                // If a match is found, remove its corresponding HTML element from the DOM using its ID.
                findByIdAndRemove(cur.id);
                // Delete the button's data from the central widgets dictionary.
                delete all[key];
                // Return true to indicate success.
                return true;
            }
        }

        // If the loop completes without finding a match, return false.
        return false;
    }
}