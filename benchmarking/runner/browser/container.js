import {
    RUNNER_SCRIPT_PATH
} from '../shared/config';

import IframeWrapper from './iframe-wrapper';
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

function createRunnerIframe ({ element, bundle, onError }) {
    const body = element.querySelector(TEMPLATE_SELECTORS.iframe);
    const iframe = new IframeWrapper(body, onError);

    return Promise.resolve()
        .then(() => iframe.injectScript(RUNNER_SCRIPT_PATH))
        .then(() => iframe.injectScript(bundle.fileUrl))
        .then(() => iframe);
}

function listMatchingBenchmarks(container, config) {
    return createRunnerIframe(container).then(iframe => {
        const { runner } = iframe.window;
        let benchmarks = runner.getRegisteredBenchmark().map(benchmark => benchmark.name);

        if (config.grep) {
            const regex = new RegExp(config.grep, 'i');
            benchmarks = benchmarks.filter(name => name.match(regex));
        }

        iframe.destroy();

        return benchmarks;
    });
}

function runBenchmark(container, config, name) {
    return createRunnerIframe(container).then(iframe => {
        const { runner } = iframe.window;
        return runner.runSingleBenchmark(name, config).then(res => {
            iframe.destroy();

            // Do a local copy of the benchmark results, it prevents the iframe from leaking.
            return JSON.parse(JSON.stringify(res));
        });
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
