import { wire, LightningElement } from "lwc";
import { getFoo } from "data-service";
const spreadMe = {
  key1: "$prop2"
}
export default class Test extends LightningElement {
  @wire(getFoo, {
    ...spreadMe,
    ...({key2: "$prop2"})
  })
  wiredProp;
}
