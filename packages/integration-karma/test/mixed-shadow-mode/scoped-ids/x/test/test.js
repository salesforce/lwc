import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static shadowMode = 'any';

    get yamanashi() {
        return 'yamanashi';
    }

    get ariaLabelledBy() {
        return 'yamanashi shizuoka';
    }
}
