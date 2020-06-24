import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, h: api_element, k: api_key, i: api_iterator } = $api;
  return [
    api_element(
      "section",
      {
        key: 3,
      },
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            classMap: {
              "my-list": true,
            },
            key: api_key(2, item.id),
          },
          [
            api_element(
              "p",
              {
                key: 1,
              },
              [api_dynamic(item, 0)]
            ),
          ]
        );
      })
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
