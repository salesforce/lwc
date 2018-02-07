import { Element } from "engine";

const style = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, h: api_element } = $api;

    return [api_element(
        "section",
        {
            key: 1
        },
        [api_text("Test")]
    )];
}

if (style) {
  const tagName = "x-class_and_template";
  const token = "x-class_and_template_class_and_template";

  tmpl.token = token;
  tmpl.style = style(tagName, token);
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
ClassAndTemplate.style = tmpl.style;

export default ClassAndTemplate;
