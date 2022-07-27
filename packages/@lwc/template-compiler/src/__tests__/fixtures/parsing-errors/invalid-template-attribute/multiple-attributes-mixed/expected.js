import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
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
        1,
        api_iterator($cmp.items, function (item) {
          return $cmp.showItems
            ? api_element(
                "p",
                {
                  key: item.id,
                },
                [api_text("1" + api_dynamic_text(item))]
              )
            : null;
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
