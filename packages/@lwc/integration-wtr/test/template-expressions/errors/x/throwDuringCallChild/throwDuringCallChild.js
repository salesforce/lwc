import { LightningElement } from 'lwc';

export default class Test extends LightningElement {
    runRunAsFastAsYouCan() {
        throw new Error("You can't catch me, I'm the Gingerbread man!");
    }
}
