import { onMounted, onUnmounted, ref, computed  } from 'vue';
import type {Ref} from 'vue';

interface Hotkey {
    keys: string[];
    handler: (event: KeyboardEvent) => void;
    description?: string;
    prevent?: boolean;
    stopPropagation?: boolean;
    context?: string | null | Ref<string | null>;
}

const hotkeyMap = new Map<string, Hotkey>();
const activeContext: Ref<string | null> = ref(null);

/**
 * Sets the currently active hotkey context.
 * Hotkeys registered with a 'context' will only be active when this context matches.
 * @param context The name of the context to activate, or null to clear.
 */
export const setActiveHotkeyContext = (context: string | null) => {
    activeContext.value = context;
};

/**
 * A Vue composable for registering and managing global keyboard hotkeys.
 */
export function useHotkeys() {
    /**
     * Registers a new hotkey.
     * @param id A unique identifier for the hotkey.
     * @param hotkey The hotkey configuration.
     */
    const registerHotkey = (id: string, hotkey: Hotkey) => {
        if (hotkeyMap.has(id)) {
            console.warn(`Hotkey with ID "${id}" already registered. Overwriting.`);
        }
        hotkeyMap.set(id, hotkey);
    };

    /**
     * Unregisters a hotkey by its ID.
     * @param id The unique identifier of the hotkey to unregister.
     */
    const unregisterHotkey = (id: string) => {
        hotkeyMap.delete(id);
    };

    /**
     * The global keydown handler that dispatches hotkey events.
     * @param event The keyboard event.
     */
    const handleGlobalKeydown = (event: KeyboardEvent) => {
        // Check if the event target is an input field, textarea, or contenteditable
        const target = event.target as HTMLElement;
        const isTypingInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        for (const hotkey of hotkeyMap.values()) {
            // Determine if the hotkey's context matches the active context
            const hotkeyContext = typeof hotkey.context === 'object' && hotkey.context !== null && 'value' in hotkey.context
                ? hotkey.context.value
                : hotkey.context;

            const isActiveContextMatch = hotkeyContext
                ? activeContext.value === hotkeyContext
                : activeContext.value === null; // Hotkeys without context are always active unless a context is active

            if (!isActiveContextMatch) {
                continue;
            }

            // Special handling for hotkeys that should not trigger while typing in inputs
            if (isTypingInput && !hotkey.keys.includes('Escape')) { // Allow Escape to close modals even from inputs
                continue;
            }

            const allKeysPressed = hotkey.keys.every((key) => {
                if (key === 'Control') return event.ctrlKey;
                if (key === 'Shift') return event.shiftKey;
                if (key === 'Alt') return event.altKey;
                if (key === 'Meta') return event.metaKey; // Command key on Mac
                return event.key === key;
            });

            // Ensure no extra modifier keys are pressed unless explicitly part of the hotkey
            const modifiersMatch =
                (hotkey.keys.includes('Control') || !event.ctrlKey) &&
                (hotkey.keys.includes('Shift') || !event.shiftKey) &&
                (hotkey.keys.includes('Alt') || !event.altKey) &&
                (hotkey.keys.includes('Meta') || !event.metaKey);


            if (allKeysPressed && modifiersMatch) {
                if (hotkey.prevent) {
                    event.preventDefault();
                }
                if (hotkey.stopPropagation) {
                    event.stopPropagation();
                }
                hotkey.handler(event);
                return;
            }
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleGlobalKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleGlobalKeydown);
        hotkeyMap.clear();
    });

    return {
        registerHotkey,
        unregisterHotkey,
        setActiveHotkeyContext,
        activeContext: computed(() => activeContext.value),
    };
}