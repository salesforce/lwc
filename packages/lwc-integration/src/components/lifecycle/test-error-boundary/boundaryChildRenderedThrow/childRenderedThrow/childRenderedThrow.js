import { Element } from 'engine'

export default class ChildRenderedThrow extends Element {
    renderedCallback() {
        throw new Error("Child threw in renderedCallback");
    }
}
