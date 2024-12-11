import { LightningElement } from 'lwc';

export default class CustomButton extends LightningElement {
    get computedClassNames() {
        return [
            {
                button__icon: true,
            },
        ];
    }
}
