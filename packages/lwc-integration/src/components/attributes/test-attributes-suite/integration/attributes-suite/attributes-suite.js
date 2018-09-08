import { LightningElement, createElement, track } from "lwc";
import Child from './my-child/my-child';

export default class AttributesSuite extends LightningElement {

    @track state = { title: "Title value from parent's state" };

    constructor() {
        super();
    }

    renderedCallback() {
        const childElm = createElement('my-child', { is: Child });
        childElm.setAttribute('tabindex', '4');
        childElm.setAttribute('title', 'im child title');
        childElm.removeAttribute('tabindex');

        const hostElm = document.querySelector('#childhost');
        hostElm.appendChild(childElm);
    }
}
