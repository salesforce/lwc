export default class Test {}
Test.wire = {
    innerRecord: {
        type: "record",
        params: { recordId: "recordId" },
        static: { fields: ["Account", 'Rate'] }
    }
};
Test.observedAttributes = ["record-id"];
