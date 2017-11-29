import { Element, createElement } from 'engine';
import Child from './my-child/my-child';

export default class AttributesSuite extends Element {

    @track state = { title: "Title value from parent's state" };

    constructor() {
        super();
    }

    renderedCallback() {
        const childElm = createElement('my-child', { is: Child });
        childElm.setAttribute('tabindex', '0');
        childElm.setAttribute('title', 'im child title');
        childElm.removeAttribute('tabindex');

        const hostElm = document.querySelector('#childhost');
        hostElm.appendChild(childElm);
    }

    forceAttr() {
        const childElm = this.root.querySelector('my-child-offender');
        childElm.setAttribute('id', 1);
    }
}
