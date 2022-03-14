import { wire } from "lwc";
import Foo from "foo";
export default class Test {
  @wire(Foo.Bar.Buzz, {}) wiredProp;
}
