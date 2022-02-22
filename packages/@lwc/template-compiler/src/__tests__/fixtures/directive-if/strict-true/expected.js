import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      $cmp.isTrue === true ? api_element("p", stc1, [api_text("1")]) : null,
    ]),
  ];
  /*LWC compiler v2.9.0*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
