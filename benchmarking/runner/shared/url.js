export function formatUrl(url, qs) {
    let query = Object.keys(qs).reduce((acc, key) => (
        qs[key] == null ?
            acc :
            `${acc}&${encodeURIComponent(key)}=${encodeURIComponent(qs[key])}`
    ), '?');

    return url + query;
}

export function isAbsoluteUrl(path) {
    return path.startsWith('http://') || path.startsWith('https://');
}

export function parseQueryString(url) {
    const params = {};

    if (url.includes('?')) {
        const search = url.slice(url.indexOf('?') + 1);

        for (let param of search.split('&')) {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        }
    }

   return params;
}
