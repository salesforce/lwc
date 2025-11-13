import { LightningElement } from 'lwc';
import asStatic from './asStatic.css';
import asStaticV2 from './asStaticV2.css';

export default class extends LightningElement {
    static renderMode = 'light';
    static stylesheets = [asStatic];

    static asStatic = asStatic;
    static asStaticV2 = asStaticV2;
}
