import { registerTemplate, renderer } from "lwc";
const stc0 = {
  attrs: {
    viewBox: "0 0 30 10",
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element, fid: api_scoped_frag_id } = $api;
  return [
    api_element("svg", stc0, [
      api_element("circle", {
        attrs: {
          id: api_scoped_id($cmp.id),
          cx: "5",
          cy: "5",
          r: "4",
          stroke: "black",
        },
        key: 1,
        svg: true,
      }),
      api_element("use", {
        attrs: {
          href: api_scoped_frag_id($cmp.id),
          x: "10",
          fill: "blue",
        },
        key: 2,
        svg: true,
        renderer: renderer,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
