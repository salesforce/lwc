import { parseSVGFragment, registerTemplate, renderer } from "lwc";
const $fragment1 = parseSVGFragment`<circle${"a0:id"} cx="5" cy="5" r="4" stroke="black"${3}/>`;
const stc0 = {
  attrs: {
    viewBox: "0 0 30 10",
    xmlns: "http://www.w3.org/2000/svg",
  },
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
    fid: api_scoped_frag_id,
    h: api_element,
  } = $api;
  return [
    api_element("svg", stc0, [
      api_static_fragment($fragment1, 2, [
        api_static_part(
          0,
          {
            attrs: {
              id: api_scoped_id($cmp.id),
            },
          },
          null
        ),
      ]),
      api_element("use", {
        attrs: {
          href: api_scoped_frag_id($cmp.id),
          x: "10",
          fill: "blue",
        },
        key: 3,
        svg: true,
        renderer: renderer,
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
