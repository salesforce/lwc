import _xPert from "x/pert";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    c: api_custom_element,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_custom_element("x-pert", _xPert, {
        props: {
          foo: [1, $cmp.bar, "baz"],
        },
        key: 1,
      }),
      api_text(api_dynamic_text(["flop", $cmp.floo, 2].join(""))),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
