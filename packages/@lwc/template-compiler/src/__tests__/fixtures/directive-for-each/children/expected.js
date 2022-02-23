import { registerTemplate } from "lwc";
const stc0 = {
  classMap: {
    s1: true,
  },
  key: 0,
};
const stc1 = {
  key: 1,
};
const stc2 = {
  classMap: {
    s2: true,
  },
  key: 2,
};
const stc3 = [];
const stc4 = {
  classMap: {
    s3: true,
  },
  key: 5,
};
const stc5 = {
  key: 6,
};
const stc6 = {
  classMap: {
    s4: true,
  },
  key: 8,
};
const stc7 = {
  key: 9,
};
const stc8 = {
  key: 10,
};
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    t: api_text,
    i: api_iterator,
    h: api_element,
    f: api_flatten,
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
        api_element("p", stc1, [api_text("Last child")]),
      ])
    ),
    api_element(
      "section",
      stc2,
      api_flatten([
        api_text("Other Child"),
        $cmp.isTrue
          ? api_iterator($cmp.items, function (item) {
              return [
                api_element(
                  "p",
                  {
                    key: api_key(3, item.id),
                  },
                  [api_text("X1")]
                ),
                api_element(
                  "p",
                  {
                    key: api_key(4, item.id),
                  },
                  [api_text("X2")]
                ),
              ];
            })
          : stc3,
      ])
    ),
    api_element(
      "section",
      stc4,
      api_flatten([
        api_element("p", stc5, [api_text("Last child")]),
        api_iterator($cmp.items, function (item) {
          return api_element("div", {
            key: api_key(7, item.id),
          });
        }),
      ])
    ),
    api_element("section", stc6, [
      api_element("p", stc7, [api_text("Other child1")]),
      api_element("p", stc8, [api_text("Other child2")]),
    ]),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
