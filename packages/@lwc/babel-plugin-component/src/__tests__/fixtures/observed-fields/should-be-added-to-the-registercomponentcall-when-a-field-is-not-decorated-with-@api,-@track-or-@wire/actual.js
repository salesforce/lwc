import { api, wire, track, createElement, LightningElement } from "lwc";
export default class Test extends LightningElement {
  state;
  @track foo;
  @track bar;

  @api label;

  record = {
    value: "test",
  };

  @api
  someMethod() {}

  @wire(createElement) wiredProp;
}
