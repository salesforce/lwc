import { Element } from 'engine'

export default class ChildSlotThrow extends Element {
    renderedCallback(){
        throw new Error("Slot thew an error during rendering");
    }
}
