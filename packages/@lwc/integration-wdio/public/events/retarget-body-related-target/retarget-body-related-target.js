(function (lwc) {
    'use strict';

    const $fragment1 = lwc.parseFragment`<span class="related-target-tagname${0}"${2}>${"t1"}</span>`;
    const $fragment2 = lwc.parseFragment`<input class="input${0}"${2}>`;
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {d: api_dynamic_text, sp: api_static_part, st: api_static_fragment, b: api_bind} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(1, null, api_dynamic_text($cmp.relatedTargetTagName))]), api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focusin": api_bind($cmp.handleFocusIn)
        })
      }, null)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-7fm2ijnq9ij";
    tmpl.legacyStylesheetToken = "integration-retarget-body-related-target_retarget-body-related-target";
    lwc.freezeTemplate(tmpl);

    class RetargetBodyRelatedTarget extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.relatedTargetTagName = void 0;
      }
      connectedCallback() {
        document.body.tabIndex = 0;
      }
      handleFocusIn(evt) {
        this.relatedTargetTagName = evt.relatedTarget.tagName.toLowerCase();
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(RetargetBodyRelatedTarget, {
      track: {
        relatedTargetTagName: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(RetargetBodyRelatedTarget, {
      tmpl: _tmpl,
      sel: "integration-retarget-body-related-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-retarget-body-related-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
