import { wire } from "lwc";
const ID = "adapterId";
export default class Test {
  @wire(ID, {}) wiredProp;
}
