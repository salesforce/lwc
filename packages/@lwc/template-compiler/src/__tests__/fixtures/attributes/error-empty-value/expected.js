import _fooBar from "foo/bar";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element } = $api;
  return [
    api_element(
      "p",
      {
        attrs: {
          title: ""
        },
        key: 0
      },
      []
    ),
    api_custom_element(
      "foo-bar",
      _fooBar,
      {
        props: {
          content: "",
          visible: true
        },
        key: 1
      },
      []
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
