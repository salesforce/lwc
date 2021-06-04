import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static preferNativeShadow = true;

    get yamanashi() {
        return 'yamanashi';
    }

    get ariaLabelledBy() {
        return 'yamanashi shizuoka';
    }
}
