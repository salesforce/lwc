/* eslint-disable no-console */
import { LightningElement } from 'lwc';

export default class extends LightningElement {
    handleClick() {
        const button: Element | undefined = this.refs?.button;
        console.log('This is a ref to the button!', button);
    }
}
