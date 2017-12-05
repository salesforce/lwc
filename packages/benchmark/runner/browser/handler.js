import {
    HANDLER_ACK_ENDPOINT,
    HANDLER_ERROR_ENDPOINT,
    HANDLER_RESULTS_ENDPOINT,
} from '../shared/config';

function postJSON(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Unexpected response ${response.status}`);
        }
    })
}

function ack(handler) {
    return postJSON(handler + HANDLER_ACK_ENDPOINT, {})
}

function postError(handler, err) {
    return postJSON(handler + HANDLER_ERROR_ENDPOINT, {
        message: err.message,
        stack: err.stack || '',
    });
}

function postResults(handler, results) {
    return postJSON(handler + HANDLER_RESULTS_ENDPOINT, results)
}

export default function register(handler) {
    return ack(handler).then(() => {

        window.onerror = (msg, src, line, col, err) => {
            postError(handler, err)
        };

        window.addEventListener('unhandledrejection', rejected => {
            postError(handler, rejected.reason);
        });

        return {
            onError: err => postError(handler, err),
            onResults: res => postResults(handler, res)
        }
    });
}
