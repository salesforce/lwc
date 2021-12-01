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
const stc3 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element("table", stc0, [
      api_element("tbody", stc1, [api_element("tr", stc2, stc3)]),
    ]),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
