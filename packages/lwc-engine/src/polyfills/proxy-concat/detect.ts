export default function detect(): boolean {
    // Don't apply polyfill when ProxyCompat is enabled.
    if ('getKey' in Proxy) {
        return false;
    }

    const proxy = new Proxy([3, 4], {});
    const res = [1, 2].concat(proxy);

    return res.length !== 4;
}
