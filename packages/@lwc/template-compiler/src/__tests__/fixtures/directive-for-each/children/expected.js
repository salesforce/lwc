import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>Last child</p>`;
const $fragment2 = parseFragment`<p${3}>Last child</p>`;
const $fragment3 = parseFragment`<section class="s4${0}"${2}><p${3}>Other child1</p><p${3}>Other child2</p></section>`;
const stc0 = {
  classMap: {
    s1: true,
  },
  key: 0,
};
const stc1 = {
  classMap: {
    s2: true,
  },
  key: 4,
};
const stc2 = {
  classMap: {
    s3: true,
  },
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    i: api_iterator,
    fr: api_fragment,
    st: api_static_fragment,
    h: api_element,
  } = $api;
  return [
    api_element("section", stc0, [
      api_text("Other Child"),
      api_fragment(
        1,
        api_iterator($cmp.items, function (item) {
          return api_text("X");
        })
      ),
      api_static_fragment($fragment1(), 3),
    ]),
    api_element("section", stc1, [
      api_text("Other Child"),
      $cmp.isTrue
        ? api_fragment(
            5,
            api_iterator($cmp.items, function (item) {
              return api_fragment($cmp.item.id, [
                api_element(
                  "p",
                  {
                    key: $cmp.item.id,
                  },
                  [api_text("X1")]
                ),
                api_element(
                  "p",
                  {
                    key: item.id,
                  },
                  [api_text("X2")]
                ),
              ]);
            })
          )
        : null,
    ]),
    api_element("section", stc2, [
      api_static_fragment($fragment2(), 8),
      api_fragment(
        9,
        api_iterator($cmp.items, function (item) {
          return api_element("div", {
            key: item.id,
          });
        })
      ),
    ]),
    api_static_fragment($fragment3(), 11),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
