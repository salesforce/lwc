import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  function foreach1_0(line) {
    return api_element(
      "line",
      {
        attrs: {
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
        },
        key: api_key(1, line.key),
        svg: true,
      },
      []
    );
  }
  const { k: api_key, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "svg",
      {
        key: 0,
        svg: true,
      },
      api_iterator($cmp.lines, foreach1_0)
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
