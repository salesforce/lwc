import _implicitStylesheets from "./comment-escaping.css";
import _implicitScopedStylesheets from "./comment-escaping.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<h1${3}><!-- --&gt;&lt;script&gt;alert(&#x27;pwned&#x27;)&lt;/script&gt; &lt;!-- --></h1>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [api_static_fragment($fragment1, 1)];
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6hk9n52i71a";
tmpl.legacyStylesheetToken = "x-comment-escaping_comment-escaping";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
