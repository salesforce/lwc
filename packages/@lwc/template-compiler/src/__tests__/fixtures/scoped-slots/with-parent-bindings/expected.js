import _xList from "x/list";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>${"t1"}</div>`;
const $fragment2 = parseFragment`<span${3}>${"t1"}</span>`;
const stc0 = {
  key: 0,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    sp: api_static_part,
    st: api_static_fragment,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
  } = $api;
  return [
    api_text(api_dynamic_text($cmp.title)),
    api_custom_element("x-list", _xList, stc0, [
      api_scoped_slot_factory("", function (item, key) {
        return api_fragment(
          key,
          [
            api_static_fragment($fragment1, 2, [
              api_static_part(1, null, api_dynamic_text($cmp.label)),
            ]),
            api_static_fragment($fragment2, 4, [
              api_static_part(
                1,
                null,
                api_dynamic_text(item.id) + " - " + api_dynamic_text(item.name)
              ),
            ]),
          ],
          0
        );
      }),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
