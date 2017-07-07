import { Element } from "engine";
export default class Test extends Element {
  @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
  innerRecordMethod() {}
  static observedAttributes = ['foo'];
}
