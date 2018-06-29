import { Element, track } from 'engine';

export default class App extends Element {
    @track childTextContent;

    renderedCallback() {
        this.childTextContent = this.template.querySelector('x-child').textContent;
    }
}
