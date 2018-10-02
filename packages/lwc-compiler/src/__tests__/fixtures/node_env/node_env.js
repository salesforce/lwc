import { LightningElement } from "lwc";
export default class ClassAndTemplate extends LightningElement {
    connectedCallback() {
        if (process.env.NODE_ENV !== 'production') {
            this.root.querySelector('insideOfProductionCheck');
        }
        this.root.querySelector('outsideOfProductionCheck');
    }
}
