import { LightningElement } from 'lwc';

export default class Mouseover extends LightningElement {
    hovering = false;

    onMouseEnter = () => {
        this.hovering = true;
    };

    onMouseLeave = () => {
        this.hovering = false;
    };
}
