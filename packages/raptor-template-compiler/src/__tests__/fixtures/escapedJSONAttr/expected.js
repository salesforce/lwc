import _xTest from "x-test";
export default function tmpl($api, $cmp, $slotset, $ctx) {
  return [
    $api.c("x-test", _xTest, {
      props: {
        json: '[{"column":"ID","value":"5e","operator":"equals","f":true}]'
      }
    })
  ];
}
