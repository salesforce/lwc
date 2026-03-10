import { LightningElement } from 'lwc';
export default class Test extends LightningElement {
    #privateMethod() {
        return 1;
    }
    normalPublicMethod() {
        return 2;
    }
    _underscoreMethod() {
        return 3;
    }
}
