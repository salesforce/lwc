import { registerTemplate } from "lwc";
const stc0 = {
  attrs: {
    width: "200",
    height: "200",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  attrs: {
    "xlink:href": "/foo.png",
    x: "1",
    y: "2",
    height: "200",
    width: "200",
  },
  key: 1,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [api_element("svg", stc0, [api_element("image", stc1)])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
