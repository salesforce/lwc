import { LightningElement } from "lwc";
import rel from './relative';
import rel2 from './other/relative2.js';
export default class RelativeImport extends LightningElement {
    constructor () {
        super();
        this.x = rel();
        this.y = rel2();
    }
}
