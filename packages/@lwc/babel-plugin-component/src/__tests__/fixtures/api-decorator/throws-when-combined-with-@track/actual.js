import { api, track, LightningElement } from "lwc";
export default class Test extends LightningElement {
  @track
  @api
  apiWithTrack = "foo";
}
