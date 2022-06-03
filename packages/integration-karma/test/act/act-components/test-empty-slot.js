/* eslint-disable */
export default function (define) {
    return define('records/recordLayout2', ['force/foo', 'lwc'], function (_forceFoo, lwc) {
        function _interopDefaultLegacy(e) {
            return e && typeof e === 'object' && 'default' in e ? e : { default: e };
        }
        var _forceFoo__default = /*#__PURE__*/ _interopDefaultLegacy(_forceFoo);
        function tmpl($api, $cmp, $slotset, $ctx) {
            const { c: api_custom_element } = $api;
            return [
                api_custom_element(
                    'force-foo',
                    _forceFoo__default['default'],
                    {
                        props: {
                            name: 'Elizabeth Shaw',
                        },
                        key: 1,
                    },
                    []
                ),
            ];
        }

        lwc.registerTemplate(tmpl);
        tmpl.stylesheets = [];
        tmpl.stylesheetToken = 'records-recordLayout2_recordLayout2';
        lwc.freezeTemplate(tmpl);
        return tmpl;
    });
}
