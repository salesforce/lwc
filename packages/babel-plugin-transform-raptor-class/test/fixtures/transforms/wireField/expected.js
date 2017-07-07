import _tmpl from "./actual.html";
import { Element } from "engine";
export default class Test extends Element {
  innerRecord;

  render() {
    return _tmpl;
  }

}
Test.wire = {
  innerRecord: {
    type: "record",
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] }
  }
};
Test.observedAttributes = ["record-id"];
