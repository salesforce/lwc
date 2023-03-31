import { LightningElement } from 'lwc';

export default class RegressionContainer extends LightningElement {
    outerVisible = true;
    innerVisible = false;

    handleClick(evt) {
        this.innerVisible = !this.innerVisible;
        evt.target.dispatchEvent(new CustomEvent('contentchange', { bubbles: true }));
    }
}
