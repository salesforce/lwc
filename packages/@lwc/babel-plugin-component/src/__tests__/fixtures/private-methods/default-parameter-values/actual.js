import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #greet(name = 'world', times = 3) {
        return name.repeat(times);
    }
}
