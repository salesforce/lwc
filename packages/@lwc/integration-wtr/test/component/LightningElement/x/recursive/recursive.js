import { createElement, LightningElement } from 'lwc';

let recursing = true;

export default class Recursive extends LightningElement {
    static get delegatesFocus() {
        if (recursing) {
            recursing = false;
            Reflect.apply(LightningElement, createElement('x-recursive', { is: Recursive }), []);
        }
        return false;
    }
}

export const resetRecursing = () => {
    recursing = true;
};
