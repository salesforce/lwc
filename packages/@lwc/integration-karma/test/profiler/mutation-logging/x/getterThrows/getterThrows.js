import { LightningElement, track } from 'lwc';

const evilArray = [{}];
Object.defineProperty(evilArray, '0', {
    get() {
        throw new Error('evil!');
    },
});

export default class extends LightningElement {
    @track trackMe = {
        doesNotThrow: 'hello',
        get throws() {
            throw new Error('haha!');
        },
        get [Symbol('throws')]() {
            throw new Error('woot!');
        },
        array: evilArray,
        deep: {
            get throws() {
                throw new Error('yolo!');
            },
        },
    };
}
