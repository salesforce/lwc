class CEWithoutChildren extends HTMLElement {
    constructor() {
        super();
    }
}
'customElements' in window && customElements.define('ce-without-children', CEWithoutChildren);
