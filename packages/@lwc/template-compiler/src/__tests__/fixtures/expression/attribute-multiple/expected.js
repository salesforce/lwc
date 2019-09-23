import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element } = $api;
  return [
    api_element(
      "section",
      {
        className: $cmp.foo.c,
        key: 1
      },
      [
        api_element(
          "p",
          {
            className: $cmp.bar.c,
            key: 0
          },
          []
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
