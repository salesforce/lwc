import { registerTemplate, renderApi } from "lwc";
const {
  co: api_comment,
  so: api_set_owner,
  t: api_text,
  h: api_element,
} = renderApi;
const $hoisted1 = api_comment(" HTML comment inside if:true ", true);
const $hoisted2 = api_text("true branch", true);
const $hoisted3 = api_comment(" HTML comment inside if:false ", true);
const $hoisted4 = api_text("false branch", true);
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    $cmp.truthyValue ? api_set_owner($hoisted1) : null,
    $cmp.truthyValue
      ? api_element("p", stc0, [api_set_owner($hoisted2)])
      : null,
    !$cmp.truthyValue ? api_set_owner($hoisted3) : null,
    !$cmp.truthyValue
      ? api_element("p", stc1, [api_set_owner($hoisted4)])
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
