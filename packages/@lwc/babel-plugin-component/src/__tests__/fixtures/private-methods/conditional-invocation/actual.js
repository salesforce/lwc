import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #processA() {
        return 'A';
    }
    #processB() {
        return 'B';
    }
    #checkCondition() {
        return true;
    }
    run(enabled) {
        const result = enabled ? this.#processA() : this.#processB();
        const checked = this.#checkCondition() && this.#processA();
        const fallback = this.#checkCondition() || this.#processB();
        const nullable = enabled ? this.#processA() : null;
        return `${result}-${checked}-${fallback}-${nullable}`;
    }
}
