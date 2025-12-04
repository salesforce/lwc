(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<span class="related-target-tabname${0}"${2}>Related target is null</span>`;
    const $fragment2 = lwc.parseFragment`<input class="focus-input${0}"${2}>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment, b: api_bind, sp: api_static_part} = $api;
      const {_m0, _m1} = $ctx;
      return [$cmp.relatedTargetIsNull ? api_static_fragment($fragment1, 1) : null, api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focus": api_bind($cmp.handleFocus)
        })
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-5in01cl00d6";
    tmpl.legacyStylesheetToken = "integration-retarget-null-related-target_retarget-null-related-target";
    lwc.freezeTemplate(tmpl);

    class RetargetRelatedTarget extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.relatedTargetIsNull = void 0;
      }
      handleFocus(evt) {
        this.relatedTargetIsNull = evt.relatedTarget === null;
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(RetargetRelatedTarget, {
      track: {
        relatedTargetIsNull: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(RetargetRelatedTarget, {
      tmpl: _tmpl,
      sel: "integration-retarget-null-related-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-retarget-null-related-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
