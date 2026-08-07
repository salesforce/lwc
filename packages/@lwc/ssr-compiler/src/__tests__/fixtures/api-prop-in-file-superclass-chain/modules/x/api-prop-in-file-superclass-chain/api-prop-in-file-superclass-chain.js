import { LightningElement, api } from 'lwc';

// W-23508928: @api props spread across a multi-level in-file chain must all reach the leaf.
class Base extends LightningElement {
    @api base;
}
class Middle extends Base {
    @api middle;
}
export default class Component extends Middle {
    @api component;
}
