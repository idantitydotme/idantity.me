import { ref, watch  } from 'vue';
import type { Ref } from 'vue';

/**
 * A Vue composable for debouncing a value from a ref.
 *
 * @param valueRef - The ref of the value to debounce.
 * @param delay - The debounced delay in milliseconds.
 * @returns A ref containing the debounced value.
 */
export function useDebounce<T>(valueRef: Ref<T>, delay: number): Ref<T> {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    // Initialize debouncedValue with the current value of the input ref
    const debouncedValue = ref(valueRef.value) as Ref<T>;

    watch(
        // Watch the actual value inside the ref
        () => valueRef.value,
        (newValue) => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                debouncedValue.value = newValue;
            }, delay);
        },
        { deep: true, immediate: true }
    );

    return debouncedValue;
}