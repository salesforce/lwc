import _cDefault from "c/default";
import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}>Elseif!</div>`;
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, st: api_static_fragment, c: api_custom_element } = $api;
  return $cmp.visible
    ? [api_text("Conditional Text")]
    : $cmp.elseifCondition
    ? [api_static_fragment($fragment1(), 1)]
    : [api_custom_element("c-default", _cDefault, stc0, [api_text("Else!")])];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
