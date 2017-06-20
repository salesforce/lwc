export default function tmpl($api, $cmp, $slotset, $ctx) {
    return $api.f([
        $api.d($cmp.val),
        $api.t(' '),
        $api.d($cmp.val[$cmp.state.foo]),
        $api.t(' '),
        $api.d($cmp.val[$cmp.state.foo][$cmp.state.bar]),
        $api.i($cmp.arr, function(item, index) {
            return [
                $api.d($cmp.arr[index]),
                $api.t(' '),
                $api.d($cmp.arr[$cmp.state.val])
            ];
        })
    ]);
}
