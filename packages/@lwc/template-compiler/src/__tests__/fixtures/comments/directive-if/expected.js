import { registerTemplate, renderApi } from "lwc";
const { co: api_comment, t: api_text, h: api_element } = renderApi;
const $hoisted1 = api_comment(" HTML comment inside if:true ", true);
const $hoisted2 = api_comment(" HTML comment inside if:false ", true);
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    $cmp.truthyValue ? $hoisted1 : null,
    $cmp.truthyValue ? api_element("p", stc0, [api_text("true branch")]) : null,
    !$cmp.truthyValue ? $hoisted2 : null,
    !$cmp.truthyValue
      ? api_element("p", stc1, [api_text("false branch")])
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
