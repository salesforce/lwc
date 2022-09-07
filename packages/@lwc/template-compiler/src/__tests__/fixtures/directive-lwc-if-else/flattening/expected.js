import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Happy days!</h1>`;
const $fragment2 = parseFragment`<h1${3}>stranger</h1>`;
const $fragment3 = parseFragment`<h1${3}>things</h1>`;
const $fragment4 = parseFragment`<h1${3}>hello</h1>`;
const $fragment5 = parseFragment`<h1${3}>world!</h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, st: api_static_fragment, f: api_flatten } = $api;
  return api_flatten([
    $cmp.visible
      ? [api_text("Conditional Text"), api_static_fragment($fragment1(), 1)]
      : [
          api_static_fragment($fragment2(), 3),
          api_static_fragment($fragment3(), 5),
        ],
    api_static_fragment($fragment4(), 7),
    api_static_fragment($fragment5(), 9),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
