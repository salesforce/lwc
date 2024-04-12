import _implicitStylesheets from "./static-id-in-iteration.css";
import _implicitScopedStylesheets from "./static-id-in-iteration.scoped.css?scoped=true";
import { freezeTemplate, registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    gid: api_scoped_id,
    h: api_element,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_iterator($cmp.items, function (item) {
      return api_element(
        "div",
        {
          key: api_key(0, item.key),
        },
        [
          api_element("span", {
            attrs: {
              id: api_scoped_id("a"),
            },
            key: 1,
          }),
        ]
      );
    }),
    api_iterator($cmp.items, function (item) {
      return api_element("span", {
        attrs: {
          id: api_scoped_id("b"),
        },
        key: api_key(2, item.key),
      });
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
        return api_element(
          "div",
          {
            key: api_key(3, item.key),
          },
          [
            api_element("span", {
              attrs: {
                id: api_scoped_id("c"),
              },
              key: 4,
            }),
          ]
        );
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
        return api_element("span", {
          attrs: {
            id: api_scoped_id("d"),
          },
          key: api_key(5, item.key),
        });
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
