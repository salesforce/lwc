export default class Test {
    innerRecordMethod() {}
}
Test.wire = {
    innerRecordMethod: {
        type: "record",
        params: { recordId: "recordId" },
        static: { fields: ["Account", 'Rate'] },
        method: 1
    }
};
Test.observedAttributes = ["record-id"];
