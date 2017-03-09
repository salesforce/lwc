import { HTMLElement } from 'raptor';

const RUNNER_FILE_URL = '/runner.js';

const STATUS = {
    waiting: 'waiting',
    running: 'running',
    success: 'success',
    failure: 'failure'
};

const STATUS_THEME = {
    waiting: '',
    running: '--warning',
    success: '--success',
    failure: '--error'
}

function injectScriptInIframe(iframe, src) {
    return new Promise((resolve, reject) => {
        let scriptTag = iframe.contentDocument.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.src = src;
        iframe.contentDocument.body.appendChild(scriptTag);

        scriptTag.onerror = (...args) => reject(args);
        scriptTag.onload = resolve;
    });
}

export default class BundleRunner extends HTMLElement {
    bundle;
    config;

    constructor() {
        super();

        this.status = STATUS.waiting;
        this.pendingBenchmarks = [];
        this.results = [];
    }

    get progressStyle() {
        return `background:red;`
    }

    get statusStyle() {
        return `run-status slds-badge slds-theme${STATUS_THEME[this.status]}`;
    }

    connectedCallback() {
        this.createNewIframe().then(iframe => {
            // List the available benchmarks and set them as pending
            const { runner } =  iframe.contentWindow;
            this.pendingBenchmarks = runner.getRegisteredBenchmark()
                .map(({ name }) => name);

            // Remove benchmarks not matching with the filtering
            if (this.config.grep) {
                const regex = new RegExp(this.config.grep, 'i');
                this.pendingBenchmarks = this.pendingBenchmarks
                    .filter(name => name.match(regex));
            }

            // Notify the shell that the Runner is ready
            const readyEvent = new CustomEvent('ready', {
                detail: {
                    run: () => this.run()
                }
            });
            this.dispatchEvent(readyEvent);
        });
    }

    createNewIframe() {
        // Delete existing iframe if present
        const container = this.querySelector('#iframe-container');
        while (container.hasChildNodes()) {
            container.removeChild(container.firstChild);
        }

        // Create iframe
        const iframe = document.createElement('iframe');
        container.appendChild(iframe);

        // Styling
        iframe.frameBorder = 0;
        iframe.style.width = '100%';
        iframe.style.minHeight = '300px';
        iframe.style.background = 'white';

        // Inject scripts and wait for ready
        const bundleFileUrl = `${this.bundle.url.href}/bundle.js`;
        return Promise.resolve()
            .then(() => injectScriptInIframe(iframe, RUNNER_FILE_URL))
            .then(() => injectScriptInIframe(iframe, bundleFileUrl))
            .then(() => iframe);
    }

    run() {
        this.status = STATUS.running;

        this.runNextBenchmark().then(
            () => this.onSuccess(),
            err => this.onFailure(err)
        );
    }

    runNextBenchmark() {
        // Set progress bar
        const progress = this.querySelector('.progress-bar');
        const total = this.pendingBenchmarks.length + this.results.length;
        progress.style.width = `${(this.results.length / total) * 100}%`;

        // Exit if there is no more benchmarks
        if (!this.pendingBenchmarks.length) {
            return;
        }

        // Shift the pending benchmark list
        const [next, ...pending] = this.pendingBenchmarks;
        this.pendingBenchmarks = pending;

        // Create a brand new iframe for the next benchmark
        return this.createNewIframe().then(iframe => {
            const { runner } = iframe.contentWindow;
            return runner.runSingleBenchmark(next, this.config);
        }).then(data => {
            this.results.push(data);
            return this.runNextBenchmark();
        })
    }

    onSuccess() {
        this.status = STATUS.success;
        const successEvent = new CustomEvent('done', { detail: this.results });
        this.dispatchEvent(successEvent);
    }

    onFailure(err) {
        this.status = STATUS.failure;
        const errEvent = new CustomEvent('error', { detail: err });
        this.dispatchEvent(errEvent);
    }
}
