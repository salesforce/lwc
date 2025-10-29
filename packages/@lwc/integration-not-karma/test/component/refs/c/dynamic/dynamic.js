import { LightningElement, api } from 'lwc';
import Basic from 'x/basic';

export default class extends LightningElement {
    ctor;

    @api
    setDynamicConstructor() {
        this.ctor = Basic;
    }

    @api
    getRef(name) {
        return this.refs[name];
    }
}
