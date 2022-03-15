import { api } from "lwc";
export default class Text {
  foo = 1;

  @api
  get foo() {}
  set foo(value) {}
}
