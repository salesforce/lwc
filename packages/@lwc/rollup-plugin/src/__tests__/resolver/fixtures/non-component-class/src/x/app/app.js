import { LightningElement } from "lwc";

class NotALightningElement {
}

class AlsoNotALightningElement {
    foo = 'bar'
}

export default class App extends LightningElement {
    renderedCallback() {
        console.log(NotALightningElement, AlsoNotALightningElement)
    }
}