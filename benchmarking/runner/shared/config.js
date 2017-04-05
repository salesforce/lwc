export const BASE_CONFIG = {
    delay: 50,
    minSampleCount: 30,
    maxDuration: 5 * 1000,
    start: false,
};

export const HANDLER_RESULTS_ENDPOINT = '/results';
export const HANDLER_ACK_ENDPOINT = '/ack';
export const HANDLER_ERROR_ENDPOINT = '/error';

export const RUNNER_SCRIPT_PATH = 'iframe-runner.js';

export const BUNDLE_FILE_NAMES = {
    info: 'info.json',
    js: 'bundle.js'
};

export const SAMPLES_THREESHOLD = 0.8;

function parseQueryString(search) {
    const params = {};

    for (let param of search.slice(1).split('&')) {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    }

    return params;
}

function serializeQueryString(params) {
    return Object.keys(params).reduce((acc, key) => {
        if (params[key] != null) {
            acc += `&${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
        }

        return acc;
    }, '?');
}

export function fromQueryString(search) {
    const queryStringParams = parseQueryString(search);
    const params = Object.assign({}, BASE_CONFIG, queryStringParams);

    return {
        base: params.base,
        compare: params.compare,
        start: params.start,
        grep: params.grep,
        handlerHostname: params.handlerHostname,
        minSampleCount: parseInt(params.minSampleCount),
        maxDuration: parseInt(params.maxDuration),
    };
}

export function toQueryString(params) {
    return serializeQueryString(Object.assign({}, BASE_CONFIG, params));
}
