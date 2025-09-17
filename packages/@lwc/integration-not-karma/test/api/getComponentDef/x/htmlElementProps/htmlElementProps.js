import { LightningElement } from 'lwc';

export default class HtmlElementProps extends LightningElement {
    constructor() {
        super();
    }

    attributes = 'baz';
    tabIndex = 'bar';
    title = 'foo';
}
