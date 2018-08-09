import { LightningElement } from "lwc";

export default class App extends LightningElement {
    handleClick() {
        const child = this.root.querySelector('x-child');
        child.foo();
    }
}
