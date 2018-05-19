import { Element, track } from 'engine';

export default class InjectStyle extends Element {
    @track dimensions;

    renderedCallback() {
        if (this.dimensions === undefined) {
            const { width, height } = this.getBoundingClientRect();
            this.dimensions = `${width}x${height}`;
        }
    }
}
