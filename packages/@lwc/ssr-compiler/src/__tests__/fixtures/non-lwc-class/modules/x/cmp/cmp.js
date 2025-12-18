import { LightningElement } from 'lwc';
import valueFromNonLightningElement from 'x/notLightningElement';

export default class Cmp extends LightningElement {
    foo = valueFromNonLightningElement;
}
