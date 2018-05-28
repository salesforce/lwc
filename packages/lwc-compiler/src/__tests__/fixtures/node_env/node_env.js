import { Element } from "engine";
export default class ClassAndTemplate extends Element {
    connectedCallback() {
        if(process.env.NODE_ENV !== 'production') {
            this.root.querySelector('insideOfProductionCheck');
        }
        this.root.querySelector('outsideOfProductionCheck');
    }
}