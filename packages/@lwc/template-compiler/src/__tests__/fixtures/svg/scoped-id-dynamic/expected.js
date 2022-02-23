import { registerTemplate, sanitizeAttribute } from "lwc";
const stc0 = {
  attrs: {
    width: "100px",
    height: "100px",
    viewport: "0 0 100 100",
  },
  key: 0,
  svg: true,
};
const stc1 = {
  key: 1,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { gid: api_scoped_id, h: api_element, fid: api_scoped_frag_id } = $api;
  return [
    api_element("svg", stc0, [
      api_element("defs", stc1, [
        api_element("circle", {
          attrs: {
            id: api_scoped_id($cmp.blackId),
            r: "10",
            cx: "10",
            cy: "10",
            fill: "black",
          },
          key: 2,
          svg: true,
        }),
        api_element("circle", {
          attrs: {
            id: api_scoped_id($cmp.redId),
            r: "10",
            cx: "14",
            cy: "14",
            fill: "red",
          },
          key: 3,
          svg: true,
        }),
      ]),
      api_element("use", {
        attrs: {
          href: sanitizeAttribute(
            "use",
            "http://www.w3.org/2000/svg",
            "href",
            api_scoped_frag_id($cmp.blackUrl)
          ),
        },
        key: 4,
        svg: true,
      }),
      api_element("use", {
        attrs: {
          "xlink:href": sanitizeAttribute(
            "use",
            "http://www.w3.org/2000/svg",
            "xlink:href",
            api_scoped_frag_id($cmp.redUrl)
          ),
        },
        key: 5,
        svg: true,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
