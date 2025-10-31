import { LightningElement, api } from 'lwc';

import template from './sideEffectDuringRender.html';

export default class extends LightningElement {
    @api foo;

    render() {
        // side effect here
        this.foo = 'foo';
        return template;
    }
}
