import { LightningElement } from "lwc";

class NotALightningElement {
}

class AlsoNotALightningElement {
    foo = 'bar'
}

export default class App extends LightningElement {
    renderedCallback() {
        // eslint-disable-next-line no-console
        console.log(NotALightningElement, AlsoNotALightningElement)
    }
}