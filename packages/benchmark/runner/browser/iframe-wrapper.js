/**
 * Helper class arround the iframe HTML Element.
 */
export default class IframeWrapper {
    /**
     * @param {HTMLElement} parent - The parent element to inject the iframe into
     * @param {Function} errorHandler - Callback calls if an error occurs in the iframe context
     */
    constructor(parent, errorHandler = () => {}) {
        this.el = document.createElement('iframe');
        parent.appendChild(this.el);

        this.onError = (msg, err, lin, col, error) => errorHandler(error);
        this.onUnhandledRejection = promise => errorHandler(promise.reason);
        this.attachEventListeners();
    }

    /**
     * Properly destroy the iframe element
     */
    destroy() {
        this.detachEventListeners();
        this.el.parentNode.removeChild(this.el);
    }

    /**
     * Inject a script tag in the iframe.
     * @param {String} src Script tag source attribute value
     * @returns a Promise resolving once the script has loaded. If the script fails
     * to load, the promise is rejected.
     */
    injectScript(src) {
        let scriptTag = this.document.createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.src = src;
        this.document.body.appendChild(scriptTag);

        return new Promise((resolve, reject) => {
            const onLoad = () => {
                // Remove attached event listeners to avoid the script tag to leak
                removeEventListeners();
                resolve();
            }

            const removeEventListeners = () => {
                scriptTag.removeEventListener('error', reject);
                scriptTag.removeEventListener('load', onLoad);
            }

            scriptTag.addEventListener('error', reject);
            scriptTag.addEventListener('load', onLoad);
        });
    }

    get window() {
        return this.el.contentWindow;
    }

    get document() {
        return this.el.contentDocument;
    }

    attachEventListeners() {
        this.el.addEventListener('error', this.onError);
        this.el.addEventListener('unhandledrejection', this.onUnhandledRejection);
    }

    detachEventListeners() {
        this.el.removeEventListener('error', this.onError);
        this.el.removeEventListener('unhandledrejection', this.onUnhandledRejection);
    }
}
