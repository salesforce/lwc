export default class _class {}
_class.wire = {
    innerRecord: {
        type: "record",
        params: { recordId: "recordId" },
        static: { fields: ["Account", 'Rate'] }
    }
};
_class.observedAttributes = ["record-id"];
