import { LightningElement } from 'lwc';

export default class ChildRenderedThrow extends LightningElement {
    renderedCallback() {
        throw new Error('Child threw in renderedCallback');
    }
}
