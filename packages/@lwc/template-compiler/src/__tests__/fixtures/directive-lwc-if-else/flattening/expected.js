import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Happy days!</h1>`;
const $fragment2 = parseFragment`<h1${3}>stranger</h1>`;
const $fragment3 = parseFragment`<h1${3}>things</h1>`;
const $fragment4 = parseFragment`<h1${3}>hello</h1>`;
const $fragment5 = parseFragment`<h1${3}>world!</h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { t: api_text, st: api_static_fragment, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment(
          0,
          [api_text("Conditional Text"), api_static_fragment($fragment1(), 2)],
          0
        )
      : api_fragment(
          0,
          [
            api_static_fragment($fragment2(), 4),
            api_static_fragment($fragment3(), 6),
          ],
          0
        ),
    api_static_fragment($fragment4(), 8),
    api_static_fragment($fragment5(), 10),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
