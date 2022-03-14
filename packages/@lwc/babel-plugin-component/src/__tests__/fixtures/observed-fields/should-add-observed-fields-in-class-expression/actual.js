import { api, wire, track, createElement, LightningElement } from "lwc";

const Test = class extends LightningElement {
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
};

const foo = Test;

export default foo;
