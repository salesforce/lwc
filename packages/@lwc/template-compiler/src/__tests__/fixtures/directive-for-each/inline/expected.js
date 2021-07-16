import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_0(item) {
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
          [api_text("items")]
        ),
      ]
    );
  }
  const { k: api_key, t: api_text, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "section",
      {
        key: 0,
      },
      api_iterator($cmp.items, foreach1_0)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
