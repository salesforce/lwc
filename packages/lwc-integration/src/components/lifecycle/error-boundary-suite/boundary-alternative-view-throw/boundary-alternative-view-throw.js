import { Element, track } from 'engine';

export default class BoundaryAltViewThrow extends Element {
    @track state = { error: false, title: "initial" };
}
