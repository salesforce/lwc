import { api } from "lwc";
export default class Text {
  @api foo = 1;
  @api foo() {
    return "foo";
  }
}
