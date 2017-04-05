export function mapSeriePromise(list, fn, results = []) {
    if (!list.length) {
        return results;
    }

    const [next, ...rest] = list;
    return Promise.resolve(
        fn(next, results.length)
    ).then(res => (
        mapSeriePromise(rest, fn, [...results, res])
    ));
}

export function removeNodeChildren(node) {
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
}
