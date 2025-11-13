import { LightningElement, createElement } from 'lwc';

import Child from 'x/child';

export default class Nested extends LightningElement {
    renderedCallback() {
        const elm = createElement('x-child', { is: Child });
        document.body.appendChild(elm);
    }
}
