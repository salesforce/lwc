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
          htmlFor: `${api_scoped_id("foo")}`
        },
        key: 2
      },
      []
    ),
    api_custom_element(
      "x-description",
      _xDescription,
      {
        props: {
          id: api_scoped_id("bar")
        },
        key: 3
      },
      []
    ),
    api_custom_element(
      "x-description",
      _xDescription,
      {
        props: {
          id: api_scoped_id("baz")
        },
        key: 4
      },
      []
    ),
    api_custom_element(
      "x-textarea",
      _xTextarea,
      {
        props: {
          id: api_scoped_id("foo"),
          ariaDescribedBy: `${api_scoped_id("bar")} ${api_scoped_id("baz")}`
        },
        key: 5
      },
      []
    ),
    api_element(
      "label",
      {
        attrs: {
          for: `${api_scoped_id("boof")}`
        },
        key: 6
      },
      [api_text("label text")]
    ),
    api_element(
      "input",
      {
        attrs: {
          id: api_scoped_id("boof")
        },
        key: 7
      },
      []
    ),
    api_iterator($cmp.things, function(thing) {
      return [
        api_element(
          "p",
          {
            attrs: {
              id: api_scoped_id(thing.id)
            },
            key: api_key(9, thing.key)
          },
          [api_text("description text")]
        ),
        api_element(
          "input",
          {
            attrs: {
              "aria-describedby": api_scoped_id(thing.id)
            },
            key: api_key(10, thing.key)
          },
          []
        )
      ];
    })
  ]);
}

export default registerTemplate(tmpl);
