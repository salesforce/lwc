import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
  innerRecordMethod() {}

  render() {
    return _tmpl;
  }

}
Test.wire = {
  innerRecordMethod: {
    method: 1,
    type: "record",
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] }
  }
};
Test.observedAttributes = ["record-id"];
