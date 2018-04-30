import { Element } from 'engine';

export default class PostErrorChildView extends Element {
    renderedCallback() {
        throw new Error("Boundary Alternative Child Offender Throws");
    }
}
