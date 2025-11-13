import { LightningElement } from 'lwc';
import stylesV1 from './staleProp.scoped.css';
import stylesV2 from './stylesV2.scoped.css';
import stylesV3 from './stylesV3.scoped.css';

export default class extends LightningElement {
    static renderMode = 'light';
    static stylesV1 = stylesV1;
    static stylesV2 = stylesV2;
    static stylesV3 = stylesV3;
}
