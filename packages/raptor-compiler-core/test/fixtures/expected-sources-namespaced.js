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

export default ClassAndTemplate;
