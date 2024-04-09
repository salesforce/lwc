import _xList from "x/list";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment2 = parseFragment`<span${3}>${"t1"}</span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
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
              api_static_fragment($fragment1, 2, [
                api_static_part(1, null, api_dynamic_text(parentItem)),
              ]),
              api_static_fragment($fragment2, 4, [
                api_static_part(
                  1,
                  null,
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
