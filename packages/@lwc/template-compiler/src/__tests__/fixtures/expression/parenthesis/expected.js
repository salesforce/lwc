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
const stc3 = {
  key: 3,
};
const stc4 = {
  key: 4,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, h: api_element } = $api;
  return [
    api_element("div", stc0, [api_text(api_dynamic_text($cmp.foo))]),
    api_element("div", stc1, [api_text(api_dynamic_text($cmp.foo))]),
    api_element("div", stc2, [api_text(api_dynamic_text($cmp.foo.bar))]),
    api_element("div", stc3, [api_text(api_dynamic_text($cmp.foo.bar))]),
    api_element("div", stc4, [api_text(api_dynamic_text($cmp.foo.bar))]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
