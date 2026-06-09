/* eslint-disable no-console */
import { LightningElement } from 'lwc';

export default class extends LightningElement {
    handleClick() {
        const ƅսtţοп = this.refs?.ƅսtţοп;
        console.log('This is a ref to the button!', ƅսtţοп);
    }
}
