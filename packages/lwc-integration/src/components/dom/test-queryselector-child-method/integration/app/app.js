import { LightningElement } from "lwc";

export default class App extends LightningElement {
    handleClick() {
        const child = this.root.querySelector('integration-child');
        child.foo();
    }
}
