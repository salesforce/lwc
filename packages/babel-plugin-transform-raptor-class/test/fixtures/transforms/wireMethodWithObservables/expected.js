import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
  innerRecordMethod() {}

  render() {
    return _tmpl;
  }

}
Test.observedAttributes = ["foo", "record-id"];
Test.wire = {
  innerRecordMethod: {
    method: 1,
    type: "record",
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] }
  }
};
Test.originalObservedAttributes = ["foo"];
