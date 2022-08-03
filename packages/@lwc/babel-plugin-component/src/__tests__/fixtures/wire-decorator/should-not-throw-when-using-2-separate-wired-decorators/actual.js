import { wire } from "lwc";
import { getFoo } from "data-service";
export default class Test {
  @wire(getFoo, { key1: "$prop1", key2: ["fixed"] })
  wired1;
  @wire(getFoo, { key1: "$prop1", key2: ["array"] })
  wired2;
}
