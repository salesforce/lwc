import { LightningElement, wire } from "lwc";
import { getRecord } from "recordDataService";

export default class Test extends LightningElement {
  @wire(getRecord, { id: 1 })
  recordData;
}
