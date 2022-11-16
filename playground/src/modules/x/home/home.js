import { LightningElement } from 'lwc';

export default class Home extends LightningElement {
    renderedCallback() {
        console.log('rendered: [Home]');
    }
}