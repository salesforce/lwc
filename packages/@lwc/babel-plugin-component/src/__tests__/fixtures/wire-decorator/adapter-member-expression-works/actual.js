import { wire, LightningElement } from "lwc";
import { Foo } from "data-service";
export default class Test extends LightningElement {
  @wire(Foo.Bar, {}) wiredProp;
}
