define('x-foo', ['engine'], function (engine) {

function tmpl($api, $cmp, $slotset, $ctx) {
  return [$api.h("section", {}, [])];
}

const Test = 1;
class ClassAndTemplate extends engine.Element {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}

return ClassAndTemplate;

});
