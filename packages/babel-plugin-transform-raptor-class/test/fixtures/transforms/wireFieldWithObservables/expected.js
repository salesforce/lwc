export default class Test {}
Test.observedAttributes = ["foo", "record-id"];
Test.wire = {
    innerRecord: {
        type: "record",
        params: { recordId: "recordId" },
        static: { fields: ["Account", "Rate"] }
    }
};
Test.originalObservedAttributes = ["foo"];
