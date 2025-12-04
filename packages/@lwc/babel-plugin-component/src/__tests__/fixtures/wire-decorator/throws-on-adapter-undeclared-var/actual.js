import { LightningElement, wire } from "lwc";
export default class PublicMethods extends LightningElement {
  @wire(adapter) foo;
}
