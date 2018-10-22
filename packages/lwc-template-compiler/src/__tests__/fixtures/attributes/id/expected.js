import _xSubject from "x/subject";
import _xDescription from "x/description";
import _xTextarea from "x/textarea";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    c: api_custom_element,
    t: api_text,
    h: api_element,
    d: api_dynamic,
    k: api_key,
    i: api_iterator,
    f: api_flatten
  } = $api;

  return api_flatten([
    api_custom_element(
      "x-subject",
      _xSubject,
      {
        props: {
          htmlFor: api_scoped_id("foo", 5)
        },
        key: 2,
        update: () => {}
      },
      []
    ),
    api_custom_element(
      "x-description",
      _xDescription,
      {
        props: {
          id: api_scoped_id("bar", 3)
        },
        key: 3,
        update: () => {}
      },
      []
    ),
    api_custom_element(
      "x-description",
      _xDescription,
      {
        props: {
          id: api_scoped_id("baz", 4)
        },
        key: 4,
        update: () => {}
      },
      []
    ),
    api_custom_element(
      "x-textarea",
      _xTextarea,
      {
        props: {
          id: api_scoped_id("foo", 5),
          ariaDescribedBy: `${api_scoped_id("bar", 3)} ${api_scoped_id(
            "baz",
            4
          )}`
        },
        key: 5,
        update: () => {}
      },
      []
    ),
    api_element(
      "label",
      {
        attrs: {
          for: api_scoped_id("boof", 7)
        },
        key: 6,
        update: () => {}
      },
      [api_text("label text")]
    ),
    api_element(
      "input",
      {
        attrs: {
          id: api_scoped_id("boof", 7)
        },
        key: 7,
        update: () => {}
      },
      []
    ),
    api_iterator($cmp.things, function(thing) {
      return [
        api_element(
          "label",
          {
            attrs: {
              for: api_scoped_id("uid", api_key(11, thing.key))
            },
            key: api_key(9, thing.key),
            update: () => {}
          },
          [api_dynamic(thing.label)]
        ),
        api_element(
          "p",
          {
            attrs: {
              id: api_scoped_id("desc", api_key(10, thing.key))
            },
            key: api_key(10, thing.key),
            update: () => {}
          },
          [api_text("description text")]
        ),
        api_element(
          "input",
          {
            attrs: {
              id: api_scoped_id("uid", api_key(11, thing.key)),
              "aria-describedby": api_scoped_id("desc", api_key(10, thing.key))
            },
            key: api_key(11, thing.key),
            update: () => {}
          },
          []
        )
      ];
    })
  ]);
}

export default registerTemplate(tmpl);
