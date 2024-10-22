import _implicitStylesheets from "./no-escaping-tags.css";
import _implicitScopedStylesheets from "./no-escaping-tags.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<xmp${3}>&lt;/xmp&gt;Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></xmp>`;
const $fragment2 = parseFragment`<noembed${3}>Hello &lt;div&gt;world&lt;/div&gt; <div>foo</div></noembed>`;
const $fragment3 = parseFragment`<noframes${3}><p>It seems your browser does not support frames or is configured to not allow them.</p></noframes>`;
const stc0 = {
  key: 2,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, t: api_text, h: api_element } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_element("iframe", stc0, [
      api_text("Hello <div>world</div> <div>foo</div>"),
    ]),
    api_static_fragment($fragment2, 4),
    api_static_fragment($fragment3, 6),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-49vb5jurkcl";
tmpl.legacyStylesheetToken = "x-no-escaping-tags_no-escaping-tags";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
