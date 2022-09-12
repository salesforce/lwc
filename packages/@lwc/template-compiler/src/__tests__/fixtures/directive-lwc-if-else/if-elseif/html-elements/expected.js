import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}>Visible Header</h1>`;
const $fragment2 = parseFragment`<h1${3}>First Alternative Header</h1>`;
const stc0 = [];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, fr: api_fragment } = $api;
  return [
    $cmp.visible
      ? api_fragment("if-fr0", [api_static_fragment($fragment1(), 2)])
      : api_fragment("if-fr0", [
          $cmp.elseifCondition
            ? api_fragment("if-fr0", [api_static_fragment($fragment2(), 4)])
            : api_fragment("if-fr0", stc0),
        ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
