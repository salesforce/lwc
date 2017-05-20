function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h("section", {}, [])];
}

class FooBar {
    render() {
        return tmpl;
    }

}

export default FooBar;
