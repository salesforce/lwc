import { Element } from "engine";

function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [api_element(
        "section",
        {},
        [api_text("Test")]
    )];
}

const Test = 1;
class ClassAndTemplate extends Element {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}

export default ClassAndTemplate;
