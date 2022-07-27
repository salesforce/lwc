import { registerTemplate } from "lwc";
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    gid: api_scoped_id,
    h: api_element,
    i: api_iterator,
    fr: api_fragment,
  } = $api;
  return [
    api_fragment(
      1,
      api_iterator($cmp.items, function (item) {
        return api_element(
          "div",
          {
            key: item.key,
          },
          [
            api_element("span", {
              attrs: {
                id: api_scoped_id("a"),
              },
              key: 0,
            }),
          ]
        );
      })
    ),
    api_fragment(
      2,
      api_iterator($cmp.items, function (item) {
        return api_element("span", {
          attrs: {
            id: api_scoped_id("b"),
          },
          key: item.key,
        });
      })
    ),
    api_fragment(
      4,
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
              key: item.key,
            },
            [
              api_element("span", {
                attrs: {
                  id: api_scoped_id("c"),
                },
                key: 3,
              }),
            ]
          );
        }
      )
    ),
    api_fragment(
      5,
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
            key: item.key,
          });
        }
      )
    ),
  ];
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
