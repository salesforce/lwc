import { api, wire, track, createElement, LightningElement } from "lwc";
const PREFIX = "prefix";
export default class Test extends LightningElement {
  interface;
  ["a"] = 0;
  [`${PREFIX}Field`] = "prefixed field";
}
