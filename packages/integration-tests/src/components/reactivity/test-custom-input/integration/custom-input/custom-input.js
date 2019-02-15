import { LightningElement, track } from "lwc";

export default class CustomInput extends LightningElement {
    @track value = 30;
    @track checked = true;

    onRangeChange(event) {
        this.value = event.target.value;
    }

    handleForceValueChange() {
        this.value = 100;
        this.checked = !this.checked;
    }
}
