function tmpl($api, $cmp, $slotset, $ctx) {
    const m = $ctx.memoized || ($ctx.memoized = {});
    return [$api.h(
        "section",
        {},
        ["Test"]
    )];
}

const Test = 1;
class ClassAndTemplate {
    constructor() {
        this.t = Test;

        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}
ClassAndTemplate.publicProps = {
    t: Test
};

export default ClassAndTemplate;
