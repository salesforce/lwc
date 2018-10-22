import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, h: api_element, d: api_dynamic } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      [
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
        api_dynamic($cmp.foo),
        $cmp.isTrue
          ? api_element(
              "p",
              {
                key: 4,
                create: () => {},
                update: () => {}
              },
              [api_text("3")]
            )
          : null
      ]
    )
  ];
}

export default registerTemplate(tmpl);
