import { registerTemplate, renderApi } from "lwc";
const {
  co: api_comment,
  so: api_set_owner,
  k: api_key,
  d: api_dynamic_text,
  t: api_text,
  h: api_element,
  i: api_iterator,
} = renderApi;
const $hoisted1 = api_comment(" color ", true);
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element(
      "ul",
      stc0,
      api_iterator($cmp.colors, function (color) {
        return [
          api_set_owner($hoisted1),
          api_element(
            "li",
            {
              key: api_key(1, color),
            },
            [api_text(api_dynamic_text(color))]
          ),
        ];
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
