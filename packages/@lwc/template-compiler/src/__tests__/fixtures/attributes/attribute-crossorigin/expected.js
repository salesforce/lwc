import _implicitStylesheets from "./attribute-crossorigin.css";
import _implicitScopedStylesheets from "./attribute-crossorigin.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<img src="http://www.example.com/image.png" crossorigin="anonymous"${3}>`;
const $fragment2 = parseFragment`<video src="http://www.example.com/video.mp4" crossorigin="anonymous"${3}></video>`;
const $fragment3 = parseFragment`<audio src="http://www.example.com/video.mp3" crossorigin="anonymous"${3}></audio>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-2bplc35dp3p";
tmpl.legacyStylesheetToken = "x-attribute-crossorigin_attribute-crossorigin";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
