if (!process.env.COMPAT) {
    customElements.define(
        'ce-with-property',
        class extends HTMLElement {
            set prop(value) {
                this._prop = value;
            }
            get prop() {
                return this._prop;
            }
        }
    );
}
