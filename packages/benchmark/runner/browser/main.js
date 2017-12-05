import {
    fromQueryString,
} from '../shared/config';

import {
    getBundle,
} from '../shared/bundle';

import {
    setFormValues,
    onFormSubmit,
    setFromState,
} from './options-form';

import {
    clearAllContainers,
    createContainer,
    runContainer,
} from './container';

import {
    clearTable,
    renderResults,
} from './results-table';

import registerHandler from './handler';

import {
    mapSeriePromise,
} from './utils';

const config = fromQueryString(window.location.search);
const app = {
    config,
    running: false,
    globalHandler: {},
    bundles: [],
    containers: [],
};

if (config.handlerHostname) {
    registerHandler(config.handlerHostname).then(handlers => (
        app.globalHandler = handlers
    ));
}

setFormValues(config);

onFormSubmit((options) => {
    app.config = Object.assign({}, app.config, options);
    startApp(app);
});

if (config.start) {
    startApp(app);
}

function getBundlesFromConfig(config) {
    const { base, compare } = config;

    const bundlePromises = [
        { label: 'base', url: base},
        { label: 'compare', url: compare }
    ].filter(({ url }) => (
        url != null && url.length
    )).map(({ label, url }) => (
        getBundle(label, url)
    ));

    return Promise.all(bundlePromises);
}

function postProcessResults({ bundles }) {
    renderResults(bundles);

    const { globalHandler } = app;
    if (globalHandler.onResults) {
        globalHandler.onResults(bundles);
    }
}

function startApp(app) {
    const { config } = app;

    if (!config.base) {
        throw new Error(`Runner expect a base url`);
    } else if (app.running) {
        throw new Error('The app is already running');
    }

    const setAppState = running => {
        app.running = running;
        setFromState(app);
    }

    setAppState(true);
    clearTable();
    clearAllContainers();

    getBundlesFromConfig(config).then(bundles => {
        app.bundles = bundles;
        app.containers = bundles.map(bundle => createContainer(app, bundle));

        return mapSeriePromise(app.containers, container => (
            runContainer(container, config).then(results => (
                container.bundle.results = results
            ))
        ));
    }).then(()=> {
        postProcessResults(app);
        setAppState(false);
    }).catch(err => {
        setAppState(false);
        throw err;
    });
}
