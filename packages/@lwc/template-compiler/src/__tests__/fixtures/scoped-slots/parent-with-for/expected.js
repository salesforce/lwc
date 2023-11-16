import _xList from "x/list";
import { registerTemplate } from "lwc";
const stc0 = {
  key: 1,
};
const stc1 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.parentItems, function (parentItem) {
    return api_custom_element(
      "x-list",
      _xList,
      {
        key: api_key(0, parentItem),
      },
      [
        api_scoped_slot_factory("", function (item, key) {
          return api_fragment(
            key,
            [
              api_element("div", stc0, [
                api_text(api_dynamic_text(parentItem)),
              ]),
              api_element("span", stc1, [
                api_text(
                  api_dynamic_text(item.id) +
                    " - " +
                    api_dynamic_text(item.name)
                ),
              ]),
            ],
            0
          );
        }),
      ]
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
