if (!process.env.COMPAT) {
    customElements.define(
        'ce-with-camel-case-property',
        class extends HTMLElement {
            camelCaseProp;
        }
    );
}
