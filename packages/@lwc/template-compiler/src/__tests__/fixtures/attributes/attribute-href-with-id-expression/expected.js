import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<a${"a0:href"}${3}>KIX</a>`;
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    fid: api_scoped_frag_id,
    sp: api_static_part,
    st: api_static_fragment,
    h: api_element,
    gid: api_scoped_id,
    t: api_text,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            href: api_scoped_frag_id($cmp.narita),
          },
        },
        null
      ),
    ]),
    api_element("map", stc0, [
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id("#haneda"),
        },
        key: 3,
      }),
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id("#chubu"),
        },
        key: 4,
      }),
    ]),
    api_element(
      "h1",
      {
        attrs: {
          id: api_scoped_id("#narita"),
        },
        key: 5,
      },
      [api_text("Time to travel!")]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
