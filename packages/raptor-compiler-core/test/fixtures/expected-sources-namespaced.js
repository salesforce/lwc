function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h("section", {}, [])];
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
    t: 1
};

export default ClassAndTemplate;
