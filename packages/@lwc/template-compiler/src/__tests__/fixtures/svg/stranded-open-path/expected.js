import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const $hoisted1 = api_element(
  "svg",
  {
    attrs: {
      xmlns: "http://www.w3.org/2000/svg",
    },
    key: 0,
    svg: true,
  },
  [
    api_element("path", {
      key: 1,
      svg: true,
    }),
  ],
  true
);
function tmpl($api, $cmp, $slotset, $ctx) {
  return [$hoisted1];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
