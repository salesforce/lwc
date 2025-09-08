import { LightningElement } from 'lwc';

export default class Main extends LightningElement {
    renderedCallback() {
        this.template.querySelector('div').innerHTML = '<p>test</p>';
    }
}
