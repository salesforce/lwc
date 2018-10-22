import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element } = $api;

  return [
    $cmp.isTrue
      ? api_element(
          "p",
          {
            key: 3,
            create: () => {},
            update: () => {}
          },
          [api_text("1")]
        )
      : null,
    !$cmp.isTrue2
      ? api_element(
          "p",
          {
            key: 5,
            create: () => {},
            update: () => {}
          },
          [api_text("2")]
        )
      : null
  ];
}

export default registerTemplate(tmpl);
