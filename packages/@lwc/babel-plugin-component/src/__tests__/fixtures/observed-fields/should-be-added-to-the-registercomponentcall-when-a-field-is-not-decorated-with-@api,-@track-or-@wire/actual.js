import { api, wire, track, createElement } from "lwc";
export default class Test {
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
