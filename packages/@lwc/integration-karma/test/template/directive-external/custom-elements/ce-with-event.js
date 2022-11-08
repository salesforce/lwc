if (!process.env.COMPAT) {
    class CEWithEvent extends HTMLElement {
        constructor() {
            super();
            this.addEventListener('click', this.onClick);
        }
        onClick() {
            this.dispatchEvent(new CustomEvent('lowercaseevent'));
            this.dispatchEvent(new CustomEvent('camelEvent'));
        }
    }

    'customElements' in window && customElements.define('ce-with-event', CEWithEvent);
}
