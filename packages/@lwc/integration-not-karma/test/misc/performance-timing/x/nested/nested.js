import { LightningElement, createElement } from 'lwc';

import Child from 'c/child';

export default class Nested extends LightningElement {
    renderedCallback() {
        const elm = createElement('c-child', { is: Child });
        document.body.appendChild(elm);
    }
}
