import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #compute(a, b, ...rest) {
        return a + b + rest.length;
    }
}
