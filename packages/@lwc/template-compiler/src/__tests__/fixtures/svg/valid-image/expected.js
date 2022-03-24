import { registerTemplate, renderApi } from "lwc";
const { h: api_element } = renderApi;
const $hoisted1 = api_element(
  "svg",
  {
    attrs: {
      width: "200",
      height: "200",
    },
    key: 0,
    svg: true,
  },
  [
    api_element("image", {
      attrs: {
        "xlink:href": "/foo.png",
        x: "1",
        y: "2",
        height: "200",
        width: "200",
      },
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
