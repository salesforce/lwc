import _implicitStylesheets from "./light.css";
import _implicitScopedStylesheets from "./light.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<label for="foo"${3}>Click me:</label>`;
const $fragment2 = parseFragment`<input type="checkbox" id="foo"${3}>`;
const $fragment3 = parseFragment`<a href="#bar"${3}>Click to scroll</a>`;
const $fragment4 = parseFragment`<section id="bar"${3}>Scroll to me</section>`;
const $fragment5 = parseFragment`<label${"a0:for"}${3}>Click me:</label>`;
const $fragment6 = parseFragment`<input type="checkbox"${"a0:id"}${3}>`;
const $fragment7 = parseFragment`<a${"a0:href"}${3}>Click to scroll</a>`;
const $fragment8 = parseFragment`<section${"a0:id"}${3}>Scroll to me</section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const { st: api_static_fragment, sp: api_static_part } = $api;
  return [
    api_static_fragment($fragment1, 1),
    api_static_fragment($fragment2, 3),
    api_static_fragment($fragment3, 5),
    api_static_fragment($fragment4, 7),
    api_static_fragment($fragment5, 9, [
      api_static_part(
        0,
        {
          attrs: {
            for: $cmp.foo,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment6, 11, [
      api_static_part(
        0,
        {
          attrs: {
            id: $cmp.foo,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment7, 13, [
      api_static_part(
        0,
        {
          attrs: {
            href: $cmp.bar,
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment8, 15, [
      api_static_part(
        0,
        {
          attrs: {
            id: $cmp.bar,
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.renderMode = "light";
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-1kadf5igpar";
tmpl.legacyStylesheetToken = "x-light_light";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
