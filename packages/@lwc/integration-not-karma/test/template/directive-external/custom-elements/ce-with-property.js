customElements.define(
    'ce-with-property',
    class extends HTMLElement {
        set prop(value) {
            this._prop = value;
        }
        get prop() {
            return this._prop;
        }

        set kyoto(value) {
            this._kyoto = `${value} river`;
        }
        get kyoto() {
            return this._kyoto;
        }

        set osaka(value) {
            this._osaka = `${value} river`;
        }
        get osaka() {
            return this._osaka;
        }
    }
);
