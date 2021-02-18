import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, d: api_dynamic, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            classMap: {
              "my-list": true,
            },
            key: api_key(1, item.id),
          },
          [
            api_element(
              "p",
              {
                key: 2,
              },
              [api_dynamic(item)]
            ),
            api_element(
              "p",
              {
                key: 3,
              },
              [api_dynamic($cmp.item2)]
            ),
          ]
        );
      })
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
