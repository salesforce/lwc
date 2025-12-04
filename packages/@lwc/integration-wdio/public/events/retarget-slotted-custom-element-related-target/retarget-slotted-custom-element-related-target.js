(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input type="text" class="child-input${0}"${2}>`;
    function tmpl$2($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$2 = lwc.registerTemplate(tmpl$2);
    tmpl$2.stylesheets = [];
    tmpl$2.stylesheetToken = "lwc-74484v40a3r";
    tmpl$2.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$2);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal$2 = lwc.registerComponent(Child, {
      tmpl: _tmpl$2,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<span class="related-target-tagname${0}"${2}>${"t1"}</span>`;
    const $fragment2 = lwc.parseFragment`<input type="text"${3}>`;
    const $fragment3 = lwc.parseFragment`<br${3}>`;
    const stc0$1 = {
      key: 6
    };
    const stc1$1 = [];
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {d: api_dynamic_text, sp: api_static_part, st: api_static_fragment, b: api_bind, s: api_slot} = $api;
      const {_m0, _m1} = $ctx;
      return [api_static_fragment($fragment1, 1, [api_static_part(1, null, api_dynamic_text($cmp.relatedTargetTagname))]), api_static_fragment($fragment2, 3, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "focusin": api_bind($cmp.handleFocusIn)
        })
      }, null)]), api_static_fragment($fragment3, 5), api_slot("", stc0$1, stc1$1, $slotset)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.slots = [""];
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-5etg9jssjsj";
    tmpl$1.legacyStylesheetToken = "integration-parent_parent";
    lwc.freezeTemplate(tmpl$1);

    class Parent extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.relatedTargetTagname = void 0;
      }
      handleFocusIn(evt) {
        this.relatedTargetTagname = evt.relatedTarget.tagName.toLowerCase();
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(Parent, {
      track: {
        relatedTargetTagname: 1
      }
    });
    const __lwc_component_class_internal$1 = lwc.registerComponent(Parent, {
      tmpl: _tmpl$1,
      sel: "integration-parent",
      apiVersion: 66
    });

    const stc0 = {
      key: 0
    };
    const stc1 = {
      key: 1
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {c: api_custom_element} = $api;
      return [api_custom_element("integration-parent", __lwc_component_class_internal$1, stc0, [api_custom_element("integration-child", __lwc_component_class_internal$2, stc1)])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-ml9ot6nks3";
    tmpl.legacyStylesheetToken = "integration-retarget-slotted-custom-element-related-target_retarget-slotted-custom-element-related-target";
    lwc.freezeTemplate(tmpl);

    class RetargetRelatedTarget extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal = lwc.registerComponent(RetargetRelatedTarget, {
      tmpl: _tmpl,
      sel: "integration-retarget-slotted-custom-element-related-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-retarget-slotted-custom-element-related-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
