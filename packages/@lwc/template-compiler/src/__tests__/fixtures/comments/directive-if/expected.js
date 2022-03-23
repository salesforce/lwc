import { registerTemplate, renderApi } from "lwc";
const { co: api_comment, t: api_text, h: api_element } = renderApi;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($cmp, $slotset, $ctx) {
  return [
    $cmp.truthyValue ? api_comment(" HTML comment inside if:true ") : null,
    $cmp.truthyValue ? api_element("p", stc0, [api_text("true branch")]) : null,
    !$cmp.truthyValue ? api_comment(" HTML comment inside if:false ") : null,
    !$cmp.truthyValue
      ? api_element("p", stc1, [api_text("false branch")])
      : null,
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
