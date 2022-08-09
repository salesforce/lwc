import {parseFragment, registerTemplate} from "lwc";
const $fragment1 = parseFragment`<p${3}>{item2</p>`;
const $fragment2 = parseFragment`<p${3}>howdy</p>`;
const $fragment3 = parseFragment`<p${3}>ho</p>`;
const stc0 = {
  key: 0
};
const stc1 = {
  key: 1
};
const stc2 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const {d: api_dynamic_text, t: api_text, h: api_element, st: api_static_fragment, f: api_flatten} = $api;
  return [api_element("section", stc0, api_flatten([$cmp.showItems ? [api_element("p", stc1, [api_text(api_dynamic_text($cmp.item))]), api_static_fragment($fragment1(), 3)] : stc2, api_static_fragment($fragment2(), 5), api_static_fragment($fragment3(), 7)]))];
  /*LWC compiler v2.21.1*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
