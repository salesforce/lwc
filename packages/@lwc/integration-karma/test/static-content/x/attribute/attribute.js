import { LightningElement, api } from 'lwc';

export default class extends LightningElement {
    @api dynamicAttr = 'dynamic1';
    @api dynamicAttrNested = 'dynamic2';
    @api dynamicStyle = 'color: green;';
    @api dynamicStyleNested = 'color: violet;';
    @api dynamicClass = 'class1';
    @api dynamicClassNested = 'nestedClass1';
    @api combinedAttr = 'dynamic3';
    @api combinedStyle = 'color: orange;';
    @api combinedClass = 'combinedClass';
    @api combinedAttrNested = 'dynamic4';
    @api combinedStyleNested = 'color: black;';
    @api combinedClassNested = 'combinedClassNested';
}
