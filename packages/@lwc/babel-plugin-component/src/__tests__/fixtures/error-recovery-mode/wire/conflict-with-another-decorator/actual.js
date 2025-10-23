import { wire, api, LightningElement } from "lwc";
import { getRecord } from "lightning/uiRecordApi";

export default class Test extends LightningElement {
  @wire(getRecord, { recordId: '$recordId' })
  @api
  wiredApiProperty;
}
