export default class Test {
    innerRecordMethod() {}
}
Test.observedAttributes = ["foo", "record-id"];
Test.wire = {
    innerRecordMethod: {
        type: "record",
        params: { recordId: "recordId" },
        static: { fields: ["Account", "Rate"] },
        method: 1
    }
};
Test.originalObservedAttributes = ["foo"];
