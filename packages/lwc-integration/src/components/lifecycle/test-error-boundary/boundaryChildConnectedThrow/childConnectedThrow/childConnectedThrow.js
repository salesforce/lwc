import { Element } from 'engine'

export default class ChildConnectedThrow extends Element {
    connectedCallback() {
        throw new Error("Child threw in connectedCallback");
    }
}
