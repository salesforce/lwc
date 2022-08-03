import { wire } from "lwc";
import { getFoo } from "data-service";
export default class Test {
  @wire(getFoo, { "key 1": "$prop", "key 2": ["fixed", "array"] })
  wiredProp;
}
