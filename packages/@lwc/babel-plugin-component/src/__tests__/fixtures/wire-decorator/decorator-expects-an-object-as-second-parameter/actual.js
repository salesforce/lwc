import { wire } from "lwc";
import { getFoo } from "data-service";
export default class Test {
  @wire(getFoo, "$prop", ["fixed", "array"]) wiredProp;
}
