import { track, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @track get record() {
    return "test";
  }
}
