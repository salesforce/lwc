import { LightningElement, track } from 'lwc';

export default class InjectStyle extends LightningElement {
    @track dimensions;

    renderedCallback() {
        if (this.dimensions === undefined) {
            const { width, height } = this.getBoundingClientRect();
            this.dimensions = `${width}x${height}`;
        }
    }
}
