import { LightningElement, track } from "lwc";

export default class BoundaryChildBoundaryAltViewThrow extends LightningElement {
    @track state = { error: false, title: "initial" };

    errorCallback(error) {
        this.state.error = true;
    }
}
