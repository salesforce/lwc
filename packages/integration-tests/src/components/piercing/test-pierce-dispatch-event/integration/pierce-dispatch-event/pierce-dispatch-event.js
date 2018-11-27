import { LightningElement, track } from "lwc";

export default class PierceDispatchEvent extends LightningElement {
    @track eventCount = 0;

    handleCustom(evt) {
        this.eventCount += 1;
    }
}
