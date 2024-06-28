import _implicitStylesheets from "./static-id-in-iteration.css";
import _implicitScopedStylesheets from "./static-id-in-iteration.scoped.css?scoped=true";
import { freezeTemplate, parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<div${3}><span${"a1:id"}${3}></span></div>`;
const $fragment2 = parseFragment`<span${"a0:id"}${3}></span>`;
const $fragment3 = parseFragment`<div${3}><span${"a1:id"}${3}></span></div>`;
const $fragment4 = parseFragment`<span${"a0:id"}${3}></span>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    gid: api_scoped_id,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_iterator($cmp.items, function (item) {
      return api_static_fragment($fragment1, api_key(1, item.key), [
        api_static_part(
          1,
          {
            attrs: {
              id: api_scoped_id("a"),
            },
          },
          null
        ),
      ]);
    }),
    api_iterator($cmp.items, function (item) {
      return api_static_fragment($fragment2, api_key(3, item.key), [
        api_static_part(
          0,
          {
            attrs: {
              id: api_scoped_id("b"),
            },
          },
          null
        ),
      ]);
    }),
    api_iterator(
      $cmp.items,
      function (itemValue, itemIndex, itemFirst, itemLast) {
        const item = {
          value: itemValue,
          index: itemIndex,
          first: itemFirst,
          last: itemLast,
        };
        return api_static_fragment($fragment3, api_key(5, item.key), [
          api_static_part(
            1,
            {
              attrs: {
                id: api_scoped_id("c"),
              },
            },
            null
          ),
        ]);
      }
    ),
    api_iterator(
      $cmp.items,
      function (itemValue, itemIndex, itemFirst, itemLast) {
        const item = {
          value: itemValue,
          index: itemIndex,
          first: itemFirst,
          last: itemLast,
        };
        return api_static_fragment($fragment4, api_key(7, item.key), [
          api_static_part(
            0,
            {
              attrs: {
                id: api_scoped_id("d"),
              },
            },
            null
          ),
        ]);
      }
    ),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
tmpl.stylesheetToken = "lwc-41g515g6rr7";
tmpl.legacyStylesheetToken = "x-static-id-in-iteration_static-id-in-iteration";
if (_implicitStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
}
if (_implicitScopedStylesheets) {
  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitScopedStylesheets);
}
freezeTemplate(tmpl);
