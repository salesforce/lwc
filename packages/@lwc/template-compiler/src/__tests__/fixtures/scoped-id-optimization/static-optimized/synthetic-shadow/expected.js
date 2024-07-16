import _implicitStylesheets from "./synthetic-shadow.css";
import _implicitScopedStylesheets from "./synthetic-shadow.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<label${"a0:for"}${3}>Click me:</label>`;
const $fragment2 = parseFragment`<input type="checkbox"${"a0:id"}${3}>`;
const $fragment3 = parseFragment`<a${"a0:href"}${3}>Click to scroll</a>`;
const $fragment4 = parseFragment`<section${"a0:id"}${3}>Scroll to me</section>`;
const $fragment5 = parseFragment`<label${"a0:for"}${3}>Click me:</label>`;
const $fragment6 = parseFragment`<input type="checkbox"${"a0:id"}${3}>`;
const $fragment7 = parseFragment`<a${"a0:href"}${3}>Click to scroll</a>`;
const $fragment8 = parseFragment`<section${"a0:id"}${3}>Scroll to me</section>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
    fid: api_scoped_frag_id,
  } = $api;
  return [
    api_static_fragment($fragment1, 1, [
      api_static_part(
        0,
        {
          attrs: {
            for: api_scoped_id("foo"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 3, [
      api_static_part(
        0,
        {
          attrs: {
            id: api_scoped_id("foo"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment3, 5, [
      api_static_part(
        0,
        {
          attrs: {
            href: api_scoped_frag_id("#bar"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment4, 7, [
      api_static_part(
        0,
        {
          attrs: {
            id: api_scoped_id("bar"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment5, 9, [
      api_static_part(
        0,
        {
          attrs: {
            for: api_scoped_id($cmp.foo),
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
            id: api_scoped_id($cmp.foo),
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
            href: api_scoped_frag_id($cmp.bar),
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
            id: api_scoped_id($cmp.bar),
          },
        },
        null
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-520i124ag3i";
tmpl.legacyStylesheetToken = "x-synthetic-shadow_synthetic-shadow";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
