import { LightningElement } from "lwc";

export default class Test extends LightningElement {
  async loadComponent() {
    const module = await import(123);
  }
}
