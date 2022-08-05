import {parseFragment, registerTemplate} from "lwc";
const $fragment1 = parseFragment`<p${3}>{item2</p>`;
const stc0 = {
  key: 0
};
const stc1 = {
  key: 1
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {d: api_dynamic_text, t: api_text, h: api_element, st: api_static_fragment, f: api_flatten} = $api;
  return [api_element("section", stc0, [$cmp.showItems ? api_flatten([api_element("p", stc1, [api_text(api_dynamic_text($cmp.item))]), api_static_fragment($fragment1(), 3)]) : null])];
  /*LWC compiler v2.21.1*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
