import { api, wire, track, createElement, LightningElement } from "lwc";
const symbol = Symbol("haha");
const PREFIX = "prefix";
export default class Test extends LightningElement {
  interface;
  ["a"] = 0;
  [1337] = 0;
  [symbol] = "symbol!";
  [`${PREFIX}Field`] = "prefixed field";
}
