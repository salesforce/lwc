import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
  const { d: api_dynamic, k: api_key, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "section",
      {
        key: 1
      },
      api_iterator($cmp.items, function(xValue, xIndex, xFirst, xLast) {
        return api_element(
          "p",
          {
            key: api_key(0, $cmp.foo.index)
          },
          [api_dynamic(xValue)]
        );
      })
    )
  ];
}

export default registerTemplate(tmpl);
tmpl.stylesheets = [];
