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
  key: 3,
};
const stc2 = [];
const stc3 = {
  classMap: {
    s3: true,
  },
  key: 6,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    i: api_iterator,
    st: api_static_fragment,
    f: api_flatten,
    h: api_element,
    k: api_key,
  } = $api;
  return [
    api_element(
      "section",
      stc0,
      api_flatten([
        api_text("Other Child"),
        api_iterator($cmp.items, function (item) {
          return api_text("X");
        }),
        api_static_fragment($fragment1(), 2),
      ])
    ),
    api_element(
      "section",
      stc1,
      api_flatten([
        api_text("Other Child"),
        $cmp.isTrue
          ? api_iterator($cmp.items, function (item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(4, item.id),
                  },
                  [api_text("X1")]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(5, item.id),
                  },
                  [api_text("X2")]
                ),
              ];
            })
          : stc2,
      ])
    ),
    api_element(
      "section",
      stc3,
      api_flatten([
        api_static_fragment($fragment2(), 8),
        api_iterator($cmp.items, function (item) {
          return api_element("div", {
            key: api_key(9, item.id),
          });
        }),
      ])
    ),
    api_static_fragment($fragment3(), 11),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
