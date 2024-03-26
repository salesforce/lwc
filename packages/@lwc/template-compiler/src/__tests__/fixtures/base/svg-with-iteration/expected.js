import { parseSVGFragment, registerTemplate } from "lwc";
const $fragment1 = parseSVGFragment`<line${"a0:x1"}${"a0:y1"}${"a0:x2"}${"a0:y2"}${3}/>`;
const stc0 = {
  key: 0,
  svg: true,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
    h: api_element,
  } = $api;
  return [
    api_element(
      "svg",
      stc0,
      api_iterator($cmp.lines, function (line) {
        return api_static_fragment($fragment1, api_key(2, line.key), [
          api_static_part(
            0,
            {
              attrs: {
                x1: line.x1,
                y1: line.y1,
                x2: line.x2,
                y2: line.y2,
              },
            },
            null
          ),
        ]);
      })
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
