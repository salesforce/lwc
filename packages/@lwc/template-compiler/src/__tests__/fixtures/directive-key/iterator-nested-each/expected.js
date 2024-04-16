import { parseFragment, registerTemplate } from "lwc";
const $fragment1 = parseFragment`<p${3}>${"t1"}</p>`;
function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    k: api_key,
    d: api_dynamic_text,
    sp: api_static_part,
    st: api_static_fragment,
    i: api_iterator,
  } = $api;
  return api_iterator($cmp.features, function (feature) {
    return api_iterator(
      feature.innerFeatures,
      function (featureValue, featureIndex, featureFirst, featureLast) {
        const feature = {
          value: featureValue,
          index: featureIndex,
          first: featureFirst,
          last: featureLast,
        };
        return api_static_fragment(
          $fragment1,
          api_key(1, feature.value.label),
          [
            api_static_part(
              1,
              null,
              api_dynamic_text(feature.value.label) +
                " " +
                api_dynamic_text(feature.label)
            ),
          ]
        );
      }
    );
  });
  /*LWC compiler vX.X.X*/
}
export default registerTemplate(tmpl);
tmpl.stylesheets = [];
