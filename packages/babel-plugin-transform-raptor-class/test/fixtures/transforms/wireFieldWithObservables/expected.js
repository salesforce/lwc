import _tmpl from "./actual.html";
export default class Foo {
  innerRecord;

  render() {
    return _tmpl;
  }

}
Foo.observedAttributes = ["foo", "record-id"];
Foo.wire = {
  innerRecord: {
    type: "record",
    params: { recordId: "recordId" },
    static: { fields: ["Account", 'Rate'] }
  }
};
Foo.originalObservedAttributes = ["foo"];
