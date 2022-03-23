import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
function tmpl($cmp, $slotset, $ctx) {
  return [
    api_element("section", {
      style: $cmp.customStyle,
      key: 0,
    }),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
