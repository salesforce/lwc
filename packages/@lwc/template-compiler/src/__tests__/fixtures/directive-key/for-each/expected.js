import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
};
const stc1 = {
  "my-list": true,
};
const stc2 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_element("section", stc0, [
      api_fragment(
        2,
        api_iterator($cmp.items, function (item) {
          return api_element(
            "div",
            {
              classMap: stc1,
              key: item.id,
            },
            [api_element("p", stc2, [api_text(api_dynamic_text(item))])]
          );
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
