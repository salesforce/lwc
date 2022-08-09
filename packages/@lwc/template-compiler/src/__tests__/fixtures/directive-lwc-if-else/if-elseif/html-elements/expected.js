import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Visible Header</h1>`;
const stc0 = {
  key: 2,
};
const stc1 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, t: api_text, h: api_element } = $api;
  return $cmp.visible
    ? [api_static_fragment($fragment1(), 1)]
    : $cmp.elseifCondition
    ? [api_element("h1", stc0, [api_text("First Alternative Header")])]
    : stc1;
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
