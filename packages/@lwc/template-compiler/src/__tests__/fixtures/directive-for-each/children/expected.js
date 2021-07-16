import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const { items: $cv0_0 } = $cmp;
  function foreach4_0(item) {
    return api_element(
      "div",
      {
        key: api_key(7, item.id),
      },
      []
    );
  }
  function if2_1() {
    function foreach3_0(item) {
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
    }
    return api_iterator($cv0_0, foreach3_0);
  }
  function foreach1_0(item) {
    return api_text("X");
  }
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
      {
        classMap: {
          s1: true,
        },
        key: 0,
      },
      api_flatten([
        api_text("Other Child"),
        api_iterator($cv0_0, foreach1_0),
        api_element(
          "p",
          {
            key: 1,
          },
          [api_text("Last child")]
        ),
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s2: true,
        },
        key: 2,
      },
      api_flatten([api_text("Other Child"), $cmp.isTrue ? if2_1() : []])
    ),
    api_element(
      "section",
      {
        classMap: {
          s3: true,
        },
        key: 5,
      },
      api_flatten([
        api_element(
          "p",
          {
            key: 6,
          },
          [api_text("Last child")]
        ),
        api_iterator($cv0_0, foreach4_0),
      ])
    ),
    api_element(
      "section",
      {
        classMap: {
          s4: true,
        },
        key: 8,
      },
      [
        api_element(
          "p",
          {
            key: 9,
          },
          [api_text("Other child1")]
        ),
        api_element(
          "p",
          {
            key: 10,
          },
          [api_text("Other child2")]
        ),
      ]
    ),
  ];
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
