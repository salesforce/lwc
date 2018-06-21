import { Element, track } from 'engine';

export default class App extends Element {
    @track childInnerHTML;

    renderedCallback() {
        this.childInnerHTML = this.template.querySelector('x-child').innerHTML;
    }
}
