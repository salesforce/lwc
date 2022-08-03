import { wire } from "lwc";
import { Foo } from "data-service";
export default class Test {
  @wire(Foo.Bar, {}) wiredProp;
}
