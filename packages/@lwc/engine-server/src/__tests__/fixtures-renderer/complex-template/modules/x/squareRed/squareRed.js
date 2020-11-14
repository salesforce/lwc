import { LightningElement } from 'lwc';

export default class SquareRed extends LightningElement {
    clicked = 0;

    onClick() {
        this.clicked++;
    }
}
