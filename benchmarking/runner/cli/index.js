/* eslint-env node */

const url = require('url');
const minimist = require('minimist');
const { getBrowser } = require('./browser');
const { getHandler } = require('./callback-handler');

let timeout = null;
let browser = null;
let handler = null;

function killAll(err) {
    clearTimeout(timeout);

    if (browser) {
        browser.stop();
    }

    if (handler) {
        handler.stop();
    }

    if (err) {
        console.error(err);
    }

    process.exit(err ? 1 : 0);
}

function buildUrl(baseUrl, qs) {
    const parsed = url.parse(baseUrl);

    for (let key of Object.keys(qs)) {
        if (qs[key] == null) {
            delete qs[key];
        }
    }

    parsed.query = qs;
    return url.format(parsed);
}

const argv = minimist(process.argv.slice(2), {
    alias: {
        'b': 'browser'
    },
    default: {
        server: 'http://localhost:8000/index.html',
        timeout: 5 * 60 * 1000,
    }
});

const {
    browser: browserName,
    server: runnerUrl,
    base: basePath,
    compare: comparePath,
    grep,
} = argv;

if (!browserName) {
    throw new Error(`Missing browser parameter`);
} else if (!basePath) {
     throw new Error(`Missing base parameter`);
}

handler = getHandler();
handler.start(res => {
    console.log(res);
    killAll();
});

const runnerUrlWithParams = buildUrl(runnerUrl, {
    base: basePath,
    compare: comparePath,
    callbackUrl: handler.endpoint,
    grep,
});

browser = getBrowser(browserName, runnerUrlWithParams);
browser.start();

// Timebox the run
timeout = setTimeout(() => (
    killAll(new Error(`Error: Reached timeout of: ${argv.timeout}`))
), argv.timeout);

// Make sure to kill all if an unexpected error occurs
process.on('uncaughtException', killAll);

