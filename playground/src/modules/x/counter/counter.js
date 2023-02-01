import { LightningElement } from 'lwc';

export default class extends LightningElement {
    counter = 0;
    thing = { number: 46 };
    foo = null;
    bar = 'hey there!';

    get attrColorStyle() {
        return 'color: blue';
    }

    increment() {
        this.counter++;
    }
    decrement() {
        this.counter--;
    }
    incrementNested() {
        this.thing = {
            ...this.thing,
            number: this.thing.number + 1,
        };
    }
}
