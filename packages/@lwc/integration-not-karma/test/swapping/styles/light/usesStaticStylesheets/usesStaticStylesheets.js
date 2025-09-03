import { LightningElement } from 'lwc';
import asStatic from './asStatic.scoped.css';
import asStaticV2 from './asStaticV2.scoped.css';

export default class extends LightningElement {
    static renderMode = 'light';
    static stylesheets = [asStatic];

    static asStatic = asStatic;
    static asStaticV2 = asStaticV2;
}
