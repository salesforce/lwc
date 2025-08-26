import { LightningElement, api } from 'lwc';

import template from './sideEffectDuringRenderExternal.html';

export default class extends LightningElement {
    @api bar = '';

    render() {
        // side effect here
        const elm = this.template.querySelector('x-child-with-api-getter-setter');
        if (elm) {
            elm.baz = 'baz';
        }

        return template;
    }
}
