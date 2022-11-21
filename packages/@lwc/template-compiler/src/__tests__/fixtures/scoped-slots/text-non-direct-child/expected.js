import _xList from "x/list";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Content from parent&#x27;s template</div>`;
const stc0 = {
  key: 0,
};
const stc1 = {
  key: 1,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    d: api_dynamic_text,
    t: api_text,
    h: api_element,
    st: api_static_fragment,
    fr: api_fragment,
    ssf: api_scoped_slot_factory,
    c: api_custom_element,
  } = $api;
  return [
    api_custom_element("x-list", _xList, stc0, [
      api_scoped_slot_factory("", function (item, key) {
        return api_fragment(
          key,
          [
            api_element("span", stc1, [
              api_text(
                api_dynamic_text(item.id) + " - " + api_dynamic_text(item.name)
              ),
            ]),
            api_static_fragment($fragment1(), 3),
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
