import _implicitStylesheets from "./id.css";
import _implicitScopedStylesheets from "./id.scoped.css?scoped=true";
import _xSubject from "x/subject";
import _xDescription from "x/description";
import _xTextarea from "x/textarea";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<label${"a0:for"}${3}>label text</label>`;
const $fragment2 = parseFragment`<input${"a0:id"}${3}>`;
const $fragment3 = parseFragment`<input${"a0:id"}${3}>`;
const $fragment4 = parseFragment`<p${"a0:id"}${3}>description text</p>`;
const $fragment5 = parseFragment`<input${"a0:aria-describedby"}${3}>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    c: api_custom_element,
    sp: api_static_part,
    st: api_static_fragment,
    k: api_key,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_custom_element("x-subject", _xSubject, {
      props: {
        htmlFor: api_scoped_id("foo"),
      },
      key: 0,
    }),
    api_custom_element("x-description", _xDescription, {
      props: {
        id: api_scoped_id("bar"),
      },
      key: 1,
    }),
    api_custom_element("x-description", _xDescription, {
      props: {
        id: api_scoped_id("baz"),
      },
      key: 2,
    }),
    api_custom_element("x-textarea", _xTextarea, {
      props: {
        id: api_scoped_id("foo"),
        ariaDescribedBy: api_scoped_id("bar baz"),
      },
      key: 3,
    }),
    api_custom_element("x-textarea", _xTextarea, {
      props: {
        id: api_scoped_id($cmp.computed),
        ariaDescribedBy: api_scoped_id("bar baz"),
      },
      key: 4,
    }),
    api_static_fragment($fragment1, 6, [
      api_static_part(
        0,
        {
          attrs: {
            for: api_scoped_id("boof"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment2, 8, [
      api_static_part(
        0,
        {
          attrs: {
            id: api_scoped_id("boof"),
          },
        },
        null
      ),
    ]),
    api_static_fragment($fragment3, 10, [
      api_static_part(
        0,
        {
          attrs: {
            id: api_scoped_id($cmp.computed),
          },
        },
        null
      ),
    ]),
    api_iterator($cmp.things, function (thing) {
      return [
        api_static_fragment($fragment4, api_key(12, thing.key), [
          api_static_part(
            0,
            {
              attrs: {
                id: api_scoped_id(thing.id),
              },
            },
            null
          ),
        ]),
        api_static_fragment($fragment5, api_key(14, thing.key), [
          api_static_part(
            0,
            {
              attrs: {
                "aria-describedby": api_scoped_id(thing.id),
              },
            },
            null
          ),
        ]),
      ];
    }),
  ]);
  /*@preserve LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-6rsnvsuaeq1";
tmpl.legacyStylesheetToken = "x-id_id";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
