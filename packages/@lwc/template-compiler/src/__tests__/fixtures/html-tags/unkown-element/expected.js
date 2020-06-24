import _xCustomComponent from "x/customComponent";
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, c: api_custom_element, t: api_text } = $api;
  return [
    api_element(
      "unknonwtag",
      {
        key: 0,
      },
      []
    ),
    api_custom_element(
      "x-custom-component",
      _xCustomComponent,
      {
        props: {
          someTruthyValue: true,
        },
        key: 1,
      },
      []
    ),
    api_element(
      "span",
      {
        key: 3,
      },
      [api_text("valid tags should not warn", 2)]
    ),
    api_element(
      "spam",
      {
        key: 5,
      },
      [api_text("this tag has a typo", 4)]
    ),
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
