import _xSubject from "x/subject";
import _xDescription from "x/description";
import _xTextarea from "x/textarea";
import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    c: api_custom_element,
    h: api_element,
    k: api_key,
    i: api_iterator,
    f: api_flatten,
  } = $api;
  return api_flatten([
    api_custom_element(
      "x-subject",
      _xSubject,
      {
        props: {
          htmlFor: api_scoped_id("foo"),
        },
        key: 0,
      },
      undefined,
      64
    ),
    api_custom_element(
      "x-description",
      _xDescription,
      {
        props: {
          id: api_scoped_id("bar"),
        },
        key: 1,
      },
      undefined,
      64
    ),
    api_custom_element(
      "x-description",
      _xDescription,
      {
        props: {
          id: api_scoped_id("baz"),
        },
        key: 2,
      },
      undefined,
      64
    ),
    api_custom_element(
      "x-textarea",
      _xTextarea,
      {
        props: {
          id: api_scoped_id("foo"),
          ariaDescribedBy: api_scoped_id("bar baz"),
        },
        key: 3,
      },
      undefined,
      64
    ),
    api_element(
      "label",
      {
        attrs: {
          for: api_scoped_id("boof"),
        },
        key: 4,
      },
      "label text",
      160
    ),
    api_element(
      "input",
      {
        attrs: {
          id: api_scoped_id("boof"),
        },
        key: 5,
      },
      undefined,
      32
    ),
    api_iterator($cmp.things, function (thing) {
      return [
        api_element(
          "p",
          {
            attrs: {
              id: api_scoped_id(thing.id),
            },
            key: api_key(6, thing.key),
          },
          "description text",
          160
        ),
        api_element(
          "input",
          {
            attrs: {
              "aria-describedby": api_scoped_id(thing.id),
            },
            key: api_key(7, thing.key),
          },
          undefined,
          32
        ),
      ];
    }),
  ]);
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
