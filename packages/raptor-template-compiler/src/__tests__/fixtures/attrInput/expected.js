export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [$api.h(
        "input",
        {
            attrs: {
                type: "checkbox",
                minlength: "5",
                maxlength: "10",
            },
            props: {
                checked: true
            }
        },
        []
    )];
}
