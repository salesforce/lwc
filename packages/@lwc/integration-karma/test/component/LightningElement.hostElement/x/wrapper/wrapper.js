import { LightningElement, api } from 'lwc';

export default class Wrapper extends LightningElement {
    @api
    getDivElement() {
        return this.refs.div;
    }

    @api
    getLightElement() {
        return this.refs.light;
    }

    @api
    getShadowElement() {
        return this.refs.shadow;
    }
}
