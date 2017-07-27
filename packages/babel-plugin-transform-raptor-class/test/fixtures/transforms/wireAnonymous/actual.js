export default class {
    @wire("record", { recordId: "$recordId", fields: ["Account", 'Rate']})
    innerRecord;
}
