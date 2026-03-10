import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #process({ x, y }, [a, b]) {
        return x + y + a + b;
    }
}
