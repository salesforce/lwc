import { Element } from "engine";
import rel from './relative';
import rel2 from './other/relative2.js';
export default class RelativeImport extends Element {
    constructor () {
        super();
        this.x = rel();
        this.y = rel2();
    }
}
