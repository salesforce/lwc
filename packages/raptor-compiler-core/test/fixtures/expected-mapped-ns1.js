function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h("p", {}, [$api.t("CMP1")])];
}

class Cmp1 {
    constructor() {}

    render() {
        return tmpl;
    }

}

export default Cmp1;
