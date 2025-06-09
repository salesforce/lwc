import { LightningElement } from 'lwc';

export default class ErrorChild extends LightningElement {
    throwError() {
        throw new Error();
    }
}
