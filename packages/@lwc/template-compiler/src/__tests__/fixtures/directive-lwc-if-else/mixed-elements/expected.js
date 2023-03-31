import _cDefault from "c/default";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Elseif!</div>`;
const stc0 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    fr: api_fragment,
    st: api_static_fragment,
    c: api_custom_element,
  } = $api;
  return [
    $cmp.visible
      ? api_fragment(0, [api_text("Conditional Text")], 0)
      : $cmp.elseifCondition
      ? api_fragment(0, [api_static_fragment($fragment1(), 2)], 0)
      : api_fragment(
          0,
          [
            api_custom_element("c-default", _cDefault, stc0, [
              api_text("Else!"),
            ]),
          ],
          0
        ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
