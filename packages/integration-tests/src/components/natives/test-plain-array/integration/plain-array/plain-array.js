import { LightningElement, track } from 'lwc';

export default class ArrayPush extends LightningElement {
    @track foo = { title: 'proxy' };
    get plainPush() {
        const array = [1, 2];
        array.push(3, 4);
        return array;
    }

    get plainPushWithProxy() {
        const array = [
            {
                title: 'first',
            },
            {
                title: 'second',
            },
        ];
        array.push(this.foo, { title: 'fourth' });
        return array;
    }

    get plainConcat() {
        const array = [1, 2];
        return array.concat([3, 4]);
    }

    get plainConcatWithProxy() {
        const array = [
            {
                title: 'first',
            },
            {
                title: 'second',
            },
        ];
        return array.concat([this.foo]);
    }
}
