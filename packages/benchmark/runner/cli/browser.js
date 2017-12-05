import fs from 'fs';
import os from 'os';
import childProcess from 'child_process';

/** Know paths to browser */
const BROWSER_PATHS = {
    firefox: {
        darwin: '/Applications/Firefox.app/Contents/MacOS/firefox-bin',
        linux: 'firefox',
    },
    chrome: {
        darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        linux: 'google-chrome',
    },
    'chrome-canary': {
        darwin: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
    }
};

export const AVAILABLE_BROWSER = Object.keys(BROWSER_PATHS).filter(name => (
    os.platform() in BROWSER_PATHS[name]
));

class Browser {
    constructor(execPath, args) {
        this.execPath = execPath;
        this.args = args;

        this.process = null;
    }

    start(url) {
        if (typeof url !== 'string') {
            throw new Error('Browser expect a url to start');
        } else if (this.process) {
            throw new Error('Browser is already running');
        }

        this.process = childProcess.spawn(
            this.execPath,
            [...this.args, url],
        );


        this.process.stdout.on('data', data => console.log('[browser]', data.toString()))
        this.process.stderr.on('data', data => console.error('[browser]', data.toString()))

        this.process.on('error', err => {
            err.message = `Error while spawning the browser: ${err.message}`;
            throw err;
        });
    }

    stop() {
        if (this.process) {
            this.process.stdin.pause();
            this.process.kill();
            this.process = null;
        }
    }
}

export default function browserFactory(browser) {
    const plaform = os.platform();

    if (!BROWSER_PATHS[browser] || !BROWSER_PATHS[browser][plaform]) {
        throw new Error(`Impossible to find browser ${plaform} / ${browser}`);
    }

    const browserPath = BROWSER_PATHS[browser][plaform];
    const profilePath = fs.mkdtempSync(`/tmp/raptor-benchmarking-${browser}`);

    return new Browser(browserPath, [
        '--no-sandbox',
        `--js-flags=--expose-gc`,
        '--disable-infobars',
        '--disable-background-networking',
        '--disable-extensions',
        '--disable-translate',
        '--no-first-run',
        '--ignore-certificate-errors',
        '--enable-precise-memory-info',
        `--user-data-dir=${profilePath}`,
    ]);
}
