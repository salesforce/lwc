import { api, wire, track, createElement } from "lwc";

const Test = class {
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
