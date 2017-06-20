import _fooBar from 'foo-bar';
export default function tmpl($api, $cmp, $slotset, $ctx) {
    return [
        $api.h(
            'p',
            {
                attrs: {
                    title: ''
                }
            },
            []
        ),
        $api.c('foo-bar', _fooBar, {
            props: {
                content: '',
                visible: true
            }
        })
    ];
}
