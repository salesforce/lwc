import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api dynamicAttr = 'dynamic1';
    @api dynamicAttrNested = 'dynamic2';
    @api dynamicStyle = 'color: green;';
    @api dynamicStyleNested = 'color: violet;';
    @api combinedAttr = 'dynamic3';
    @api combinedStyle = 'color: orange;';
    @api combinedAttrNested = 'dynamic4';
    @api combinedStyleNested = 'color: black;';
}
