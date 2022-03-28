import { registerTemplate, renderApi } from "lwc";
const {
  k: api_key,
  t: api_text,
  h: api_element,
  so: api_set_owner,
  i: api_iterator,
} = renderApi;
const $hoisted1 = api_element(
  "p",
  {
    key: 2,
    isStatic: true,
  },
  [api_text("items")]
);
const stc0 = {
  key: 0,
};
const stc1 = {
  "my-list": true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    api_element(
      "section",
      stc0,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            classMap: stc1,
            key: api_key(1, item.id),
          },
          [api_set_owner($hoisted1)]
        );
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
