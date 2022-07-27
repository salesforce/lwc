import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
  } = $api;
  return [
    $cmp.isTrue
      ? api_fragment(2, [
          api_element("p", stc0, [api_text(api_dynamic_text($cmp.foo))]),
          api_element("p", stc1, [api_text(api_dynamic_text($cmp.bar))]),
        ])
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
