import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
  innerRecord;

  render() {
    return _tmpl;
  }

}
Test.observedAttributes = ["foo", "record-id"];
Test.wire = {
  innerRecord: {
    type: "record",
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] }
  }
};
Test.originalObservedAttributes = ["foo"];
