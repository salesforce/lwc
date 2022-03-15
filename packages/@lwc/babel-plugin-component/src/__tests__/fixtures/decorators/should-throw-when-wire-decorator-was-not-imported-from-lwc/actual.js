import { LightningElement } from "lwc";
import { getTodo } from "todo";
export default class Test extends LightningElement {
  @wire(getTodo, {})
  data = {};
}
