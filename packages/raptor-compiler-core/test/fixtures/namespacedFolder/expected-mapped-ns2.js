const memoized = Symbol();
var _tmpl = function ($api, $cmp, $slotset) {
    const m = $cmp[memoized] || ($cmp[memoized] = {});
    return [$api.h(
        "p",
        {},
        ["CMP1"]
    )];
};
const templateUsedIds = [];

class Cmp1 {
    constructor() {}

    render() {
        return _tmpl;
    }

}
Cmp1.tagName = "ns2-cmp1";
Cmp1.templateUsedIds = templateUsedIds;

export default Cmp1;
