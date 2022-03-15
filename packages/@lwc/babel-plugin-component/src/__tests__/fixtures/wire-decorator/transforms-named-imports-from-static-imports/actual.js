import { wire } from "lwc";
import importedValue from "ns/module";
import { getFoo } from "data-service";
export default class Test {
  @wire(getFoo, { key1: importedValue })
  wiredProp;
}
