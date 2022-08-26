import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Happy days!</h1>`;
const $fragment2 = parseFragment`<h1${3}>hello</h1>`;
const $fragment3 = parseFragment`<h1${3}>world!</h1>`;
const stc0 = {
  key: 2,
};
const stc1 = {
  key: 3,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    st: api_static_fragment,
    h: api_element,
    f: api_flatten,
  } = $api;
  return api_flatten([
    $cmp.visible
      ? [api_text("Conditional Text"), api_static_fragment($fragment1(), 1)]
      : [
          api_element("h1", stc0, [api_text("stranger")]),
          api_element("h1", stc1, [api_text("things")]),
        ],
    api_static_fragment($fragment2(), 5),
    api_static_fragment($fragment3(), 7),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
