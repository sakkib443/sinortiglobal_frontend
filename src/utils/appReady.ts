// Lightweight bridge so the Preloader (rendered in the root layout) can wait
// for a page's critical backend data before it runs to 100%. A page calls
// signalAppDataReady() once its above-the-fold data has settled; the Preloader
// listens for that signal. A window flag covers the race where data resolves
// before the Preloader's listener is attached.

export const APP_DATA_READY_EVENT = 'app:data-ready';

declare global {
    interface Window {
        __APP_DATA_READY__?: boolean;
    }
}

/** Fire once a page's critical backend data has arrived (success or error). */
export function signalAppDataReady(): void {
    if (typeof window === 'undefined') return;
    window.__APP_DATA_READY__ = true;
    window.dispatchEvent(new Event(APP_DATA_READY_EVENT));
}

/** True if a page has already signalled its data is ready. */
export function isAppDataReady(): boolean {
    return typeof window !== 'undefined' && window.__APP_DATA_READY__ === true;
}

/** Reset the flag — call on route changes that will fetch fresh critical data. */
export function resetAppDataReady(): void {
    if (typeof window === 'undefined') return;
    window.__APP_DATA_READY__ = false;
}
