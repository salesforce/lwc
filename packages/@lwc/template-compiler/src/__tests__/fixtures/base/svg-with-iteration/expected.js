import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { k: api_key, h: api_element, i: api_iterator } = $api;
  return [
    api_element(
      "svg",
      stc0,
      api_iterator($cmp.lines, function (line) {
        return api_element("line", {
          attrs: {
            x1: line.x1,
            y1: line.y1,
            x2: line.x2,
            y2: line.y2,
          },
          key: api_key(1, line.key),
          svg: true,
        });
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
