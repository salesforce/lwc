/* eslint-disable */
export default function (define) {
    return define(
        'records/recordLayout2',
        ['ui/outputpercent', 'lwc'],
        function (_uiOutputpercent, lwc) {
            function _interopDefaultLegacy(e) {
                return e && typeof e === 'object' && 'default' in e ? e : { default: e };
            }
            var _uiOutputpercent__default = /*#__PURE__*/ _interopDefaultLegacy(_uiOutputpercent);
            function tmpl($api, $cmp, $slotset, $ctx) {
                const { b: api_bind, c: api_custom_element } = $api;
                const { _m0 } = $ctx;
                return [
                    api_custom_element(
                        'ui-outputpercent',
                        _uiOutputpercent__default['default'],
                        {
                            props: {
                                notWhitelisted: $cmp.non.value,
                                templateExpression: $cmp.state.recordAvatars,
                                label: $cmp.data.label,
                                value: $cmp.data.record,
                            },
                            key: 1,
                            on: {
                                togglesectioncollapsed:
                                    _m0 || ($ctx._m0 = api_bind($cmp.handleToggleSectionCollapsed)),
                            },
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
        }
    );
}
