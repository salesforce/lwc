import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_0(item) {
    return api_element(
      "li",
      {
        key: api_key(1, item.key),
      },
      [api_dynamic(item.value)]
    );
  }
  const { k: api_key, d: api_dynamic, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "ul",
      {
        key: 0,
      },
      api_iterator($cmp.items, foreach1_0)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
