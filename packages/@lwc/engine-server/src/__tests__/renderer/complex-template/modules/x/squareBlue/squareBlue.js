import { LightningElement } from 'lwc';

export default class SquareBlue extends LightningElement {

    clicked = 0;

    onClick() {
        this.clicked++;
    }

}
