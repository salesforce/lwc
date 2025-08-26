import { LightningElement } from 'lwc';

export default class NotInvokingSuper extends LightningElement {
    // eslint-disable-next-line constructor-super
    constructor() {}
}
