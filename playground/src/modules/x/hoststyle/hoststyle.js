import { LightningElement } from 'lwc';

export default class extends LightningElement {
    static renderMode = 'light';

    output;
    outputWorkaround;

    handleClick() {
        this.hostStyle.setProperty("color", "red")
        this.output = this.hostStyle
    }
}
