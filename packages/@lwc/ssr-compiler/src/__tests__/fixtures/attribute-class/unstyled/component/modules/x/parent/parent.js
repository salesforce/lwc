import { LightningElement } from 'lwc';
import xChild from 'x/child';

export default class CustomButton extends LightningElement {
    ctor = xChild;
    get computedClassNames() {
        return {
            button__icon: true,
        };
    }
}
