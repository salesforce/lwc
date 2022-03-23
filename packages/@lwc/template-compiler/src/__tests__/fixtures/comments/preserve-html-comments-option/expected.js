import { registerTemplate, renderApi } from "lwc";
const { co: api_comment, t: api_text, h: api_element } = renderApi;
const stc0 = {
  key: 0,
};
function tmpl($cmp, $slotset, $ctx) {
  return [
    api_comment(" This is an HTML comment "),
    api_element("button", stc0, [api_text("click me")]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
