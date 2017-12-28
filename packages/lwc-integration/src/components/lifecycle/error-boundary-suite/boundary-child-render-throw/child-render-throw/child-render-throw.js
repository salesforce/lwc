import { Element } from 'engine'

export default class ChildRenderThrow extends Element {
    constructor() {
        super();
    }
    render(){
        throw new Error("Child thew an error during rendering");
    }
}
