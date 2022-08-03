import { track } from "lwc";
export default class Test {
  @track get record() {
    return "test";
  }
}
