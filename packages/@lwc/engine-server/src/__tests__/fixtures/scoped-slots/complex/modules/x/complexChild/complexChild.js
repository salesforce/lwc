import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    itemFn() {
        return () => ({ id: 99, name: 'ssr' });
    }
}
