/* eslint-env node */

import minimist from 'minimist';

import browser from './browser';
import handler from './callback-handler';
import {
    cliFormatter,
    jsonFormatter,
    markdownFormatter,
} from './reporters';

import {
    toQueryString,
} from '../shared/config';

const argv = minimist(process.argv.slice(2), {
    default: {
        browser: 'chrome',
        reporter: 'pretty',
        server: 'https://localhost:8000/index.html',
        timeout: 5 * 60 * 1000,
    }
});

const {
    browser: browserName,
    server: runnerUrl,
    reporter: reporterType,

    base,
    compare,
    grep,
    'max-duration': maxDuration,
    'min-sample-count': minSampleCount,
} = argv;

if (!browserName) {
    throw new Error(`Missing browser parameter`);
} else if (!base) {
     throw new Error(`Missing base parameter`);
}

let reporterFactory;
switch (reporterType) {
    case 'pretty':
        reporterFactory = cliFormatter;
        break;

    case 'json':
        reporterFactory = jsonFormatter;
        break;

    case 'markdown':
        reporterFactory = markdownFormatter;
        break;

    default:
        throw new Error(`Unknown repoter type ${reporterType}`);
}

const handlerInstance = handler();
const browserInstance = browser(browserName);

const url = runnerUrl + toQueryString({
    base,
    compare,
    minSampleCount,
    maxDuration,
    grep,
    start: true,
    handlerHostname: handlerInstance.hostname,
});
console.log('Benchmark url:', url);

const reporter = reporterFactory(argv, url);

browserInstance.start(url);
handlerInstance.start((err, res) => {
    // Need to wrap the reporter call with a try-catch block because babel-node
    // doesn't handle well the uncaughtException
    try {
        reporter(err, res);
    } catch (err) {
        killAll(err);
    }

    killAll(err);
});

const timeout = setTimeout(() => (
    killAll(new Error(`Error: Reached timeout of: ${argv.timeout}`))
), argv.timeout);

process.on('uncaughtException', err => killAll(err));
process.on('unhandledRejection', reason => killAll(reason));

function killAll(err) {
    clearTimeout(timeout);

    if (browser) {
        browserInstance.stop();
    }

    if (handler) {
        handlerInstance.stop();
    }

    if (err) {
        if (reporter) {
            reporter(err);
        }

        console.error(err);
    }

    process.exit(err ? 1 : 0);
}
