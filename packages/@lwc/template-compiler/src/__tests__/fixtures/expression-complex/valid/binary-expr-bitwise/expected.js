import _xChild from "x/child";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    c: api_custom_element,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element(
        "x-child",
        _xChild,
        {
          props: {
            attr: $cmp.foo & $cmp.bar,
          },
          key: 1,
        },
        [api_text(api_dynamic_text($cmp.foo & $cmp.bar))]
      ),
      api_custom_element(
        "x-child",
        _xChild,
        {
          props: {
            attr: $cmp.foo | $cmp.bar,
          },
          key: 2,
        },
        [api_text(api_dynamic_text($cmp.foo | $cmp.bar))]
      ),
      api_custom_element(
        "x-child",
        _xChild,
        {
          props: {
            attr: $cmp.foo ^ $cmp.bar,
          },
          key: 3,
        },
        [api_text(api_dynamic_text($cmp.foo ^ $cmp.bar))]
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
