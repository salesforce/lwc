export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { t: api_text, b: api_bind, h: api_element } = $api;

    const { _m0, _m1 } = $ctx;
    return [
        api_element('section', {}, [
            api_element(
                'div',
                {
                    on: {
                        click: _m0 || ($ctx._m0 = api_bind($cmp.handleClick))
                    }
                },
                [api_text('x')]
            ),
            api_element(
                'div',
                {
                    on: {
                        press: _m1 || ($ctx._m1 = api_bind($cmp.handlePress))
                    }
                },
                [api_text('x')]
            )
        ])
    ];
}
