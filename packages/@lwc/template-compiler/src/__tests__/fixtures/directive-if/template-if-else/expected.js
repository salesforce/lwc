import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;
  return [
    $cmp.isTrue
      ? api_element(
          "p",
          {
            key: 1,
          },
          [api_text("1", 0)]
        )
      : null,
    !$cmp.isTrue2
      ? api_element(
          "p",
          {
            key: 3,
          },
          [api_text("2", 2)]
        )
      : null,
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
