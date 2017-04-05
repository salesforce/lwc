import {
    RUNNER_SCRIPT_PATH
} from '../shared/config';

import {
    removeNodeChildren,
    mapSeriePromise,
} from './utils';

const ROOT_SELECTOR = '#containers-container';

const TEMPLATE_ELEMENT_SELECTOR = '#runner-template';
const TEMPLATE_SELECTORS = {
    title: 'header h2 span:first-child',
    status: 'header h2 span:last-child',
    propList: 'header ul',
    progress: '.slds-card__body .progress-bar',
    iframe: '.slds-card__body .iframe-container',
};

const STATUS = {
    waiting: 'waiting',
    running: 'running',
    success: 'success',
    failure: 'failure'
};

const STATUS_THEME_MAP = {
    waiting: 'slds-theme',
    running: 'slds-theme--warning',
    success: 'slds-theme--success',
    failure: 'slds-theme--error'
}

const rootElement = document.querySelector(ROOT_SELECTOR);

function setStatusTheme(el, status) {
    Object.keys(STATUS_THEME_MAP)
        .map(status => STATUS_THEME_MAP[status])
        .map(theme => el.classList.remove(theme))

    el.classList.add(STATUS_THEME_MAP[status]);
}

function setStatus(container, status = container.status) {
    const statusEl = container.element.querySelector(TEMPLATE_SELECTORS.status);

    setStatusTheme(statusEl, status);
    statusEl.textContent = status;

    container.status = status;
}

function setProgress({ element, status }, value = 0) {
    const progressEl = element.querySelector(TEMPLATE_SELECTORS.progress);

    setStatusTheme(progressEl, status);
    progressEl.style.width =`${value * 100}%`;
}

function injectSript(iframe, src) {
    return new Promise((resolve, reject) => {
        let scriptTag = iframe.contentDocument.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.src = src;
        iframe.contentDocument.body.appendChild(scriptTag);

        scriptTag.onerror = (...args) => reject(args);
        scriptTag.onload = resolve;
    });
}

function createRunnerIframe ({ element, bundle, onError }) {
    const body = element.querySelector(TEMPLATE_SELECTORS.iframe);
    removeNodeChildren(body);

    const iframe = document.createElement('iframe');
    body.appendChild(iframe);

    iframe.contentWindow.onerror = (msg, err, lin, col, error) => onError(error);
    iframe.contentWindow.addEventListener('unhandledrejection', promise => onError(promise.reason));

    return Promise.resolve()
        .then(() => injectSript(iframe, RUNNER_SCRIPT_PATH))
        .then(() => injectSript(iframe, bundle.fileUrl))
        .then(() => iframe);
}

function listMatchingBenchmarks(container, config) {
    return createRunnerIframe(container).then(iframe => {
        const { runner } = iframe.contentWindow;
        let benchmarks = runner.getRegisteredBenchmark().map(benchmark => benchmark.name);

        if (config.grep) {
            const regex = new RegExp(config.grep, 'i');
            benchmarks = benchmarks.filter(name => name.match(regex));
        }

        return benchmarks;
    });
}

function runBenchmark(container, config, name) {
    return createRunnerIframe(container).then(iframe => {
        const { runner } = iframe.contentWindow;
        return runner.runSingleBenchmark(name, config);
    });
}

export function clearAllContainers() {
    removeNodeChildren(rootElement);
}

export function createContainer(app, bundle) {
    const { label, info } = bundle;

    const t = document.querySelector(TEMPLATE_ELEMENT_SELECTOR).content;
    t.querySelector(TEMPLATE_SELECTORS.title).textContent = label;
    t.querySelector(TEMPLATE_SELECTORS.propList).innerHTML = Object.keys(info)
        .map(key => `<li class="slds-item"><b>${key}:</b> ${info[key]}</li>`)
        .join('');

    const containerEl = document.importNode(t, true);
    rootElement.appendChild(containerEl);

    const container = {
        bundle,
        onError: app.globalHandler.onError,
        element: rootElement.lastElementChild,
        status: STATUS.waiting,
    };

    setStatus(container);
    setProgress(container);

    return container;
}

export function runContainer(container, config) {
    return listMatchingBenchmarks(container, config).then(pending => {
        setStatus(container, STATUS.running);

        return mapSeriePromise(pending, (name, index)  => (
            runBenchmark(container, config, name).then(res => {
                const progress = (index + 1) / pending.length;
                setProgress(container, progress);

                return res;
            })
        ));
    }).then(results => {
        setStatus(container, STATUS.success);
        setProgress(container, 1);

        return results;
    }).catch(err => {
        setStatus(container, STATUS.failure);
        setProgress(container, 1);

        throw err;
    });
}
