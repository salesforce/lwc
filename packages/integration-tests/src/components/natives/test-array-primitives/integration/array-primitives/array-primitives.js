import { track, LightningElement } from 'lwc';

const INITIAL = ['one', 'two', 'three', 'four', 'five'];

export default class ArraySpliceTest extends LightningElement {
    @track items = INITIAL.slice();

    handleSpliceClick() {
        this.items.splice(1, 1);
    }

    reset() {
        this.items = INITIAL.slice();
    }
}
