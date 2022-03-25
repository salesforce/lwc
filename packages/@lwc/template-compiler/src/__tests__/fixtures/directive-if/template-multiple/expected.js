import { registerTemplate, renderApi } from "lwc";
const { t: api_text, so: api_set_owner, h: api_element } = renderApi;
const $hoisted1 = api_text("1", true);
const $hoisted2 = api_text("2", true);
const $hoisted3 = api_text("3", true);
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
  return [
    $cmp.isTrue ? api_element("p", stc0, [api_set_owner($hoisted1)]) : null,
    $cmp.isTrue ? api_element("p", stc1, [api_set_owner($hoisted2)]) : null,
    $cmp.isTrue ? api_element("p", stc2, [api_set_owner($hoisted3)]) : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
