import { registerTemplate, renderApi } from "lwc";
const { t: api_text, so: api_set_owner, h: api_element } = renderApi;
const $hoisted1 = api_text("1");
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element("section", stc0, [
      $cmp.isTrue === true
        ? api_element("p", stc1, [api_set_owner($hoisted1)])
        : null,
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
