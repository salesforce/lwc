import { Element } from 'engine'

export default class ChildRenderThrow extends Element {
    @track counter = 1;
    get getCounter() {
        return this.counter;
    }
    renderedCallback() {
        if (this.counter === 2) {
            throw new Error("Child thew an error during rendered callback");
        }
    }
    handleClick() {
        this.counter++;
    }
}
