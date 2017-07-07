import { Element } from 'engine';

function tmpl($api, $cmp, $slotset, $ctx) {
  return [$api.h("p", {}, [$api.t("CMP1")])];
}

class Cmp1 extends Element {
    constructor() {
        super();
    }

    render() {
        return tmpl;
    }

}

export default Cmp1;
