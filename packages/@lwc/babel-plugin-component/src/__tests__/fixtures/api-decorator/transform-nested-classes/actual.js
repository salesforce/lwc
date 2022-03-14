import { api, LightningElement } from "lwc";
export default class Outer extends LightningElement {
  @api outer;
  a = class extends LightningElement {
    @api innerA;
  };
}
