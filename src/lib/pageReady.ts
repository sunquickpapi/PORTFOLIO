/**
 * Tiny "is the home page content ready?" signal. The hero marks it once the profile
 * has loaded; the nav bar shows its liquid loading fill until then.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markPageReady() {
    if (ready) return;
    ready = true;
    listeners.forEach((fn) => fn());
    listeners.clear();
}

export function isPageReady() {
    return ready;
}

export function onPageReady(fn: () => void) {
    if (ready) {
        fn();
        return () => {};
    }
    listeners.add(fn);
    return () => {
        listeners.delete(fn);
    };
}
