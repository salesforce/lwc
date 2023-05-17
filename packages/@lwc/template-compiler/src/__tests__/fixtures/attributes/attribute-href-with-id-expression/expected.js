import { registerTemplate } from "lwc";
const stc0 = ["KIX"];
const stc1 = {
  key: 1,
};
const stc2 = ["Time to travel!"];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { fid: api_scoped_frag_id, h: api_element, gid: api_scoped_id } = $api;
  return [
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id($cmp.narita),
        },
        key: 0,
      },
      stc0,
      160
    ),
    api_element(
      "map",
      stc1,
      [
        api_element(
          "area",
          {
            attrs: {
              href: api_scoped_frag_id("#haneda"),
            },
            key: 2,
          },
          undefined,
          32
        ),
        api_element(
          "area",
          {
            attrs: {
              href: api_scoped_frag_id("#chubu"),
            },
            key: 3,
          },
          undefined,
          32
        ),
      ],
      0
    ),
    api_element(
      "h1",
      {
        attrs: {
          id: api_scoped_id("#narita"),
        },
        key: 4,
      },
      stc2,
      160
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
