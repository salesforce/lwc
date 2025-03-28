import { wire, LightningElement } from "lwc";
import Foo from "foo";
export default class Test extends LightningElement {
  @wire(Foo.Bar.Buzz, {}) wiredProp;
}
