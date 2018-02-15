/** Maximum number of wire adapter provides after observable complete */
const MAX_PROVIDE_AFTER_COMPLETE = 1;

/**
 * A wired value.
 */
export class WiredValue {
    /**
     * Constructor
     * @param {Function} adapter The adapter that provides the data.
     * @param {Object} config Configuration for the adapter.
     * @param {Boolean} isMethod True if wiring to a method, false otherwise.
     * @param {*} cmp The component to which this value is wired.
     * @param {String} propName Property on the component to which this value is wired.
     */
    constructor(adapter, config, isMethod, cmp, propName) {
        this.adapter = adapter;
        this.config = config;
        this.cmp = cmp;
        this.propName = propName;
        this.isMethod = isMethod;

        // subscription to wire adapter's observable
        this.subscription = undefined;

        // count of wire adapter provides caused by receiving observable complete
        this.completeHandled = 0;

        // debounce multiple param updates so adapter is invoked only once.
        // use promise's microtask semantics.
        this.providePromise = undefined;
    }

    /**
     * Updates a configuration value.
     * @param {String} param Configuraton parameter.
     * @param {Object} value New configuration value.
     */
    update(param, value) {
        // invariant: wired value doesn't change if params don't change
        if (this.config[param] === value) {
            return;
        }

        // disconnect from previous observable
        this.release();

        this.config[param] = value;
        this.provide();
    }

    /**
     * Queues a request for the adapter to provide a new value.
     */
    provide() {
        if (!this.providePromise) {
            this.providePromise = Promise.resolve().then(() => this._provide());
        }
    }

    /**
     * Installs the WiredValue onto the target component.
     */
    install() {
        if (!this.isMethod) {
            this.cmp[this.propName] = {
                data: undefined,
                error: undefined
            };
        }
        this._provide();
    }

    /**
     * Provides a new value from the adapter.
     */
    _provide() {
        this.providePromise = undefined;

        const observable = this.adapter(this.config);
        // adapter returns falsey if config is insufficient
        if (!observable) {
            return;
        }

        const observer = this.getObserver();
        this.subscription = observable.subscribe(observer);
    }

    /**
     * Handles observable's complete signal.
     *
     * After an existing observable emits complete, conditionally re-request the
     * adapter to provide a new value. The conditions prevent a storm against the
     * adapter by limiting loops of provide, subscribe, complete, provide, repeat.
     */
    completeHandler() {
        this.release();

        this.completeHandled++;
        if (this.completeHandled > MAX_PROVIDE_AFTER_COMPLETE) {
            // TODO #15 - add telemetry so this occurrence is sent to the server
            return;
        }

        this.provide();
    }


    /**
     * Gets an observer for the adapter's observable.
     * @returns {Object} observer.
     */
    getObserver() {
        if (!this.observer) {
            if (this.isMethod) {
                const wireMethod = this.cmp[this.propName];
                this.observer = {
                    next: value => {
                        // TODO: deprecate (error, data) args
                        if (wireMethod.length === 2) {
                            // eslint-disable-next-line no-console
                            console.warn('[DEPRECATE] @wire function no longer supports two arguments (error, data), please update your code to use ({error, data}) instead.');
                            wireMethod.call(this.cmp, null, value);
                        } else {
                            wireMethod.call(this.cmp, { data: value, error: null });
                        }
                    },
                    error: err => {
                        // TODO: deprecate (error, data) args
                        if (wireMethod.length === 2) {
                            // eslint-disable-next-line no-console
                            console.warn('[DEPRECATE] @wire function no longer supports two arguments (error, data), please update your code to use ({error, data}) instead.');
                            wireMethod.call(this.cmp, err, undefined);
                        } else {
                            wireMethod.call(this.cmp, { data: undefined, error: err });
                        }
                    },
                    complete: () => {
                        this.completeHandler();
                    }
                };
            } else {
                this.observer = {
                    next: value => {
                        this.cmp[this.propName] = { 'data': value, 'error': undefined };
                    },
                    error: err => {
                        this.cmp[this.propName] = { 'data': undefined, 'error': err };
                    },
                    complete: () => {
                        this.completeHandler();
                    }
                };
            }
        }
        return this.observer;
    }

    /**
     * Release all resources.
     */
    release() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }
    }
}
