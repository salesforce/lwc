import { LightningElement } from 'lwc';

export default class TextStatic extends LightningElement {
    connectedCallback() {
        // This will throw a compile-time error in SSRv2!
        const __lwcThrowAnError__ = 'yup';
        console.log(__lwcThrowAnError__);
    }
}
