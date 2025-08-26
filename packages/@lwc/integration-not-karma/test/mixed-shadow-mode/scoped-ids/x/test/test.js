import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static shadowSupportMode = 'native';

    get yamanashi() {
        return 'yamanashi';
    }

    get ariaLabelledBy() {
        return 'yamanashi shizuoka';
    }
}
