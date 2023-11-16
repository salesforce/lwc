import { LightningElement } from 'lwc';
export default class extends LightningElement {
    mountLocation = document.body;
    open = false;

    handleOpen() {
        this.open = true;
    }

    handleClose() {
        this.open = false;
    }
}
