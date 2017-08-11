export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [
        $api.h(
            'input',
            {
                props: {
                    value: '{value}'
                }
            },
            []
        )
    ];
}
