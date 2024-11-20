import { wire, LightningElement } from "lwc";
import WireAdapter from "x/adapter";
export default class Test extends LightningElement {
    @wire(WireAdapter, { key1: "$prop1", key2: ["fixed", "array"] })
    wiredProp;

    prop1 = 'foo';
}
