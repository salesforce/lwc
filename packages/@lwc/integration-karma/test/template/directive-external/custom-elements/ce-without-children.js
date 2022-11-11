if (!process.env.COMPAT) {
    class CEWithoutChildren extends HTMLElement {
        constructor() {
            super();
        }
    }
    customElements.define('ce-without-children', CEWithoutChildren);
}
