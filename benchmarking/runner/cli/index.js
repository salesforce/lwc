/* eslint-env node */

import minimist from 'minimist';

import browser from './browser';
import handler from './callback-handler';
import reporters from './reporters';

import { formatUrl } from '../shared/url';

const argv = minimist(process.argv.slice(2), {
    default: {
        reporter: 'pretty',
        server: 'http://localhost:8000/index.html',
        timeout: 5 * 60 * 1000,
    }
});

const {
    browser: browserName,
    server: runnerUrl,
    base: basePath,
    compare: comparePath,
    reporter: reporterType,
    'max-duration': maxDuration,
    'min-sample-count': minSampleCount,
    grep,
} = argv;

if (!browserName) {
    throw new Error(`Missing browser parameter`);
} else if (!basePath) {
     throw new Error(`Missing base parameter`);
}

const reporter = reporters(reporterType, argv);
const handlerInstance = handler();
const browserInstance = browser(browserName);

const url = formatUrl(runnerUrl, {
    base: basePath,
    compare: comparePath,
    callbackUrl: handlerInstance.endpoint,
    start: true,
    minSampleCount,
    maxDuration,
    grep,
});

browserInstance.start(url);
handlerInstance.start(res => {
    try {
        reporter.run(res);
    } catch (err) {
        killAll(err);
    }

    killAll();
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
        console.error(err);
    }

    process.exit(err ? 1 : 0);
}
