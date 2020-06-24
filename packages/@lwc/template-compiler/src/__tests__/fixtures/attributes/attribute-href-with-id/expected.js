import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    fid: api_scoped_frag_id,
    h: api_element,
    gid: api_scoped_id,
  } = $api;
  return [
    api_element(
      "a",
      {
        attrs: {
          href: api_scoped_frag_id("#kansai-airport"),
        },
        key: 1,
      },
      [api_text("KIX", 0)]
    ),
    api_element(
      "map",
      {
        key: 4,
      },
      [
        api_element(
          "area",
          {
            attrs: {
              href: api_scoped_frag_id("#eneos-gas"),
            },
            key: 2,
          },
          []
        ),
        api_element(
          "area",
          {
            attrs: {
              href: api_scoped_frag_id("#kawaramachi"),
            },
            key: 3,
          },
          []
        ),
      ]
    ),
    api_element(
      "h1",
      {
        attrs: {
          id: api_scoped_id("kansai-airport"),
        },
        key: 6,
      },
      [api_text("Don't forget your passport!", 5)]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
