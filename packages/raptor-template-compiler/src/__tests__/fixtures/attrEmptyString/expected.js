import _fooBar from 'foo-bar';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    const { h: api_element, c: api_custom_element } = $api;

    return [
        api_element(
            'p',
            {
                attrs: {
                    title: ''
                }
            },
            []
        ),
        api_custom_element('foo-bar', _fooBar, {
            props: {
                content: '',
                visible: true
            }
        })
    ];
}
