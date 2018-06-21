import { Element, track } from 'engine';

export default class App extends Element {
    @track childOuterHTML;

    renderedCallback() {
        this.childOuterHTML = this.template.querySelector('x-child').outerHTML;
    }
}
