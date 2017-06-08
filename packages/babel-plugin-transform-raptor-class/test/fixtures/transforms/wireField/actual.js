export default class Foo {
  @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
  innerRecord;
}
