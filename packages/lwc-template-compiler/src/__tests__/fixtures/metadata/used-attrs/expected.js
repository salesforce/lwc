import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, h: api_element } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      [
        api_element(
          "p",
          {
            key: 3,
            create: () => {},
            update: () => {}
          },
          [api_dynamic($cmp.obj.sub)]
        )
      ]
    )
  ];
}

export default registerTemplate(tmpl);
