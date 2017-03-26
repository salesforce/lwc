import rel from './relative';
import rel2 from './other/relative2.js';
export default class RelativeImport {
    constructor () {
        this.x = rel();
        this.y = rel2();
    }
}
