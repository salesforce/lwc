import { track, wire } from "lwc";
import { getFoo } from "data-service";
export default class Test {
  @track
  @wire(getFoo, { key1: "$prop1", key2: ["fixed", "array"] })
  wiredWithTrack;
}
