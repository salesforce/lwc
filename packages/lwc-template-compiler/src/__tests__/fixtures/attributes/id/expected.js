import _xSubject from 'x/subject';
import _xDescription from 'x/description';
import _xTextarea from 'x/textarea';
import { registerTemplate } from "lwc";

function tmpl($api, $cmp, $slotset, $ctx) {
    const {
        gid: api_scoped_id,
        c: api_custom_element,
        t: api_text,
        h: api_element,
        d: api_dynamic,
        k: api_key,
        i: api_iterator,
        f: api_flatten,
    } = $api;

    return api_flatten([
        api_custom_element(
            'x-subject',
            _xSubject,
            {
                props: {
                    htmlFor: api_scoped_id(4, 'foo'),
                },
                key: 1,
            },
            []
        ),
        api_custom_element(
            'x-description',
            _xDescription,
            {
                props: {
                    id: api_scoped_id(2, 'bar'),
                },
                key: 2,
            },
            []
        ),
        api_custom_element(
            'x-description',
            _xDescription,
            {
                props: {
                    id: api_scoped_id(3, 'baz'),
                },
                key: 3,
            },
            []
        ),
        api_custom_element(
            'x-textarea',
            _xTextarea,
            {
                props: {
                    id: api_scoped_id(4, 'foo'),
                    ariaDescribedBy: `${api_scoped_id(2, 'bar')} ${api_scoped_id(3, 'baz')}`,
                },
                key: 4,
            },
            []
        ),
        api_element(
            'label',
            {
                attrs: {
                    for: api_scoped_id(6, 'boof'),
                },
                key: 5,
            },
            [api_text('label text')]
        ),
        api_element(
            'input',
            {
                attrs: {
                    id: api_scoped_id(6, 'boof'),
                },
                key: 6,
            },
            []
        ),
        api_iterator($cmp.things, function(thing) {
            return [
                api_element(
                    'label',
                    {
                        attrs: {
                            for: api_scoped_id(api_key(9, thing.key), 'uid'),
                        },
                        key: api_key(7, thing.key),
                    },
                    [api_dynamic(thing.label)]
                ),
                api_element(
                    'p',
                    {
                        attrs: {
                            id: api_scoped_id(api_key(8, thing.key), 'desc'),
                        },
                        key: api_key(8, thing.key),
                    },
                    [api_text('description text')]
                ),
                api_element(
                    'input',
                    {
                        attrs: {
                            id: api_scoped_id(api_key(9, thing.key), 'uid'),
                            'aria-describedby': api_scoped_id(api_key(8, thing.key), 'desc'),
                        },
                        key: api_key(9, thing.key),
                    },
                    []
                ),
            ];
        }),
    ]);
}

export default registerTemplate(tmpl);
