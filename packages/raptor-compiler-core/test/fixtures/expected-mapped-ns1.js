function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h("p", {}, ["CMP1"])];
}

class Cmp1 {
    constructor() {}

    render() {
        return tmpl;
    }

}

export default Cmp1;
