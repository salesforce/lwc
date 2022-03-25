import { registerTemplate, renderApi } from "lwc";
const {
  fid: api_scoped_frag_id,
  t: api_text,
  so: api_set_owner,
  h: api_element,
  gid: api_scoped_id,
} = renderApi;
const $hoisted1 = api_text("KIX");
const $hoisted2 = api_text("Don't forget your passport!");
const stc0 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id("#kansai-airport"),
        },
        key: 0,
      },
      [api_set_owner($hoisted1)]
    ),
    api_element("map", stc0, [
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id("#eneos-gas"),
        },
        key: 2,
      }),
      api_element("area", {
        attrs: {
          href: api_scoped_frag_id("#kawaramachi"),
        },
        key: 3,
      }),
    ]),
    api_element(
      "h1",
      {
        attrs: {
          id: api_scoped_id("kansai-airport"),
        },
        key: 4,
      },
      [api_set_owner($hoisted2)]
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
