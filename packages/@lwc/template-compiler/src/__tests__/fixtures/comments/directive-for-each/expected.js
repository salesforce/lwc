import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    co: api_comment,
    k: api_key,
    d: api_dynamic,
    h: api_element,
    i: api_iterator,
  } = $api;
  return [
    api_element(
      "ul",
      {
        key: 0,
      },
      api_iterator($cmp.colors, function (color) {
        return [
          api_comment(" color "),
          api_element(
            "li",
            {
              key: api_key(1, color),
            },
            [api_dynamic(color)]
          ),
        ];
      })
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
