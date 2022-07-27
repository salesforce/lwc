import { registerTemplate } from "lwc";
const stc0 = {
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const { h: api_element, i: api_iterator, fr: api_fragment } = $api;
  return [
    api_element("svg", stc0, [
      api_fragment(
        1,
        api_iterator($cmp.lines, function (line) {
          return api_element("line", {
            attrs: {
              x1: line.x1,
              y1: line.y1,
              x2: line.x2,
              y2: line.y2,
            },
            key: line.key,
            svg: true,
          });
        })
      ),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
