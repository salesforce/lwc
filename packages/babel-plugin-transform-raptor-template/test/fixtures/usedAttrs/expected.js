export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "section",
        {},
        [$api.h(
            "p",
            {},
            [$api.d($cmp.obj.sub)]
        )]
    )];
}
tmpl.ids = ["obj"];
