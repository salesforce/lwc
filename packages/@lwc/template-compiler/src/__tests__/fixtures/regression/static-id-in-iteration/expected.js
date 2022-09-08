import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    gid: api_scoped_id,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_fragment(
      "it-fr2",
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            key: api_key(0, item.key),
          },
          [
            api_element("span", {
              attrs: {
                id: api_scoped_id("a"),
              },
              key: 1,
            }),
          ]
        );
      })
    ),
    api_fragment(
      "it-fr4",
      api_iterator($cmp.items, function (item) {
        return api_element("span", {
          attrs: {
            id: api_scoped_id("b"),
          },
          key: api_key(3, item.key),
        });
      })
    ),
    api_fragment(
      "it-fr7",
      api_iterator(
        $cmp.items,
        function (itemValue, itemIndex, itemFirst, itemLast) {
          const item = {
            value: itemValue,
            index: itemIndex,
            first: itemFirst,
            last: itemLast,
          };
          return api_element(
            "div",
            {
              key: api_key(5, item.key),
            },
            [
              api_element("span", {
                attrs: {
                  id: api_scoped_id("c"),
                },
                key: 6,
              }),
            ]
          );
        }
      )
    ),
    api_fragment(
      "it-fr9",
      api_iterator(
        $cmp.items,
        function (itemValue, itemIndex, itemFirst, itemLast) {
          const item = {
            value: itemValue,
            index: itemIndex,
            first: itemFirst,
            last: itemLast,
          };
          return api_element("span", {
            attrs: {
              id: api_scoped_id("d"),
            },
            key: api_key(8, item.key),
          });
        }
      )
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
