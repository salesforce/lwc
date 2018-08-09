import { LightningElement } from "lwc";


export default class LightdomQuerySelector extends LightningElement {
    handleClick(evt) {
        const div = evt.currentTarget.querySelector('div');
        div.setAttribute('data-selected', 'true');
    }
}
