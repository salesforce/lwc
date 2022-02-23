import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_element("p", stc1, [api_text(api_dynamic_text($cmp.obj.sub))]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
