import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, d: api_dynamic_text } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue ? api_element("p", stc1, [api_text("1")]) : null,
      api_text(api_dynamic_text($cmp.foo)),
      $cmp.isTrue ? api_element("p", stc2, [api_text("3")]) : null,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
