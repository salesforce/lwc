import { wire, LightningElement } from "lwc";
import importedValue from "ns/module";
import { getFoo } from "data-service";
export default class Test extends LightningElement {
  @wire(getFoo, { key1: importedValue })
  wiredProp;
}
