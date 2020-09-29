import { LightningElement, api } from 'lwc';

export default class RegressionContainer extends LightningElement {
    outerVisible = true;
    @api innerVisible = false;

    handleClick() {
        this.innerVisible = !this.innerVisible;
    }
}