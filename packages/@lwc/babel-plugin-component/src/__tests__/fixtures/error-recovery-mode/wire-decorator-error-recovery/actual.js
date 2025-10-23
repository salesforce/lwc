import { wire, LightningElement } from "lwc";

export default class Test extends LightningElement {
  @wire(invalidConfig) // This should trigger error recovery mode handling
  wiredProperty;
}
