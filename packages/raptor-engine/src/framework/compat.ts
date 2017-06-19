const isCompatMode = typeof Proxy === 'undefined';

export default function compat(fn: () => void) {
    if (isCompatMode) {
        fn();
    }
}
