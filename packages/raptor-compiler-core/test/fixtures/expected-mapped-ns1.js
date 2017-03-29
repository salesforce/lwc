function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "p",
        {},
        ["CMP1"]
    )];
}

class Cmp1 {
    constructor() {}

    render() {
        return tmpl;
    }

}

export default Cmp1;
