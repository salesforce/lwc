export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element } = $api;

    return [
        api_element(
            'svg',
            {
                classMap: {
                    'slds-button__icon': true
                },
                attrs: {
                    viewBox: '0 0 5 5',
                    'aria-hidden': 'true'
                },
                key: 2
            },
            [
                api_element(
                    'use',
                    {
                        attrs: {
                            'xlink:href': '/x'
                        },
                        key: 1
                    },
                    []
                )
            ]
        )
    ];
}
