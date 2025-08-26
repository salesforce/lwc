import { LightningElement } from 'lwc';

export default class PostErrorChildView extends LightningElement {
    renderedCallback() {
        throw new Error('Boundary Alternative Child Offender Throws');
    }
}
