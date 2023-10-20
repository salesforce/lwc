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
const stc5 = {
  key: 5,
};
const stc6 = {
  key: 6,
};
const stc7 = {
  key: 7,
};
const stc8 = {
  key: 8,
};
const stc9 = {
  key: 9,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic_text, t: api_text, h: api_element } = $api;
  return [
    api_element("section", stc0, [
      api_element("div", stc1, [api_text(api_dynamic_text($cmp.noSpace))]),
      api_element("div", stc2, [api_text(api_dynamic_text($cmp.spaceRight))]),
      api_element("div", stc3, [api_text(api_dynamic_text($cmp.spaceLeft))]),
      api_element("div", stc4, [
        api_text(api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)),
      ]),
      api_element("div", stc5, [
        api_text(api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)),
      ]),
      api_element("div", stc6, [
        api_text(api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)),
      ]),
      api_element("div", stc7, [
        api_text(api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)),
      ]),
      api_element("div", stc8, [
        api_text(api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)),
      ]),
      api_element("div", stc9, [
        api_text(api_dynamic_text($cmp.one) + api_dynamic_text($cmp.two)),
      ]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
