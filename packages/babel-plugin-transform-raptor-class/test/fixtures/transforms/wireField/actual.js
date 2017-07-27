export default class Test {
    @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
    innerRecord;
}
