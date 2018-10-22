import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, h: api_element, k: api_key, i: api_iterator } = $api;

  return [
    api_element(
      "section",
      {
        key: 2,
        create: () => {},
        update: () => {}
      },
      api_iterator($cmp.items, function(item) {
        return api_element(
          "div",
          {
            classMap: {
              "my-list": true
            },
            key: api_key(3, item.id),
            update: () => {}
          },
          [
            api_element(
              "p",
              {
                key: 4,
                create: () => {},
                update: () => {}
              },
              [api_dynamic(item)]
            ),
            api_element(
              "p",
              {
                key: 5,
                create: () => {},
                update: () => {}
              },
              [api_dynamic($cmp.item2)]
            )
          ]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
