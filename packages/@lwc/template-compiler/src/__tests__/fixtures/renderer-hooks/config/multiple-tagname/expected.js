import _implicitStylesheets from "./multiple-tagname.css";
import _implicitScopedStylesheets from "./multiple-tagname.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate, renderer } from "lwc";
const $fragment1 = parseFragment`<h2${3}>London</h2>`;
const $fragment2 = parseFragment`<h2${3}>Paris</h2>`;
const $fragment3 = parseFragment`<p${3}>Paris is the capital of <span class="bold${0}"${2}>France.</span></p>`;
const stc0 = {
  city: true,
};
const stc1 = {
  key: 3,
};
const stc2 = [["color", "blue", false]];
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, t: api_text, h: api_element } = $api;
  return [
    api_element(
      "div",
      {
        classMap: stc0,
        key: 0,
        renderer: renderer,
      },
      [
        api_static_fragment($fragment1, 2),
        api_element("p", stc1, [
          api_text("London is the capital of "),
          api_element(
            "span",
            {
              styleDecls: stc2,
              key: 4,
              renderer: renderer,
            },
            [api_text("England.")]
          ),
        ]),
      ]
    ),
    api_element(
      "div",
      {
        classMap: stc0,
        key: 5,
        renderer: renderer,
      },
      [api_static_fragment($fragment2, 7), api_static_fragment($fragment3, 9)]
    ),
  ];
  /*!/*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-4hgahqkce";
tmpl.legacyStylesheetToken = "x-multiple-tagname_multiple-tagname";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
