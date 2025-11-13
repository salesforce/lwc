(function (lwc) {
    'use strict';

    const stc0$1 = {
      key: 0
    };
    const stc1 = [];
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {s: api_slot} = $api;
      return [api_slot("", stc0$1, stc1, $slotset)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.slots = [""];
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    class Child extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }
    const __lwc_component_class_internal$1 = lwc.registerComponent(Child, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<select${3}><option value="1"${3}>First</option><option value="2"${3}>Second</option></select>`;
    const $fragment2 = lwc.parseFragment`<div class="target-is-select${0}"${2}>Event Target is select element</div>`;
    const stc0 = {
      key: 0
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, sp: api_static_part, st: api_static_fragment, c: api_custom_element} = $api;
      const {_m0, _m1} = $ctx;
      return [api_custom_element("integration-child", __lwc_component_class_internal$1, stc0, [api_static_fragment($fragment1, 2, [api_static_part(0, {
        on: _m1 || ($ctx._m1 = {
          "change": api_bind($cmp.handleChange)
        })
      }, null)])]), $cmp.targetIsSelect ? api_static_fragment($fragment2, 4) : null];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-65smdq02dke";
    tmpl.legacyStylesheetToken = "integration-slotted-event-target_slotted-event-target";
    lwc.freezeTemplate(tmpl);

    class SlottedEventTarget extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.targetIsSelect = false;
      }
      handleChange(evt) {
        this.targetIsSelect = evt.target.tagName.toLowerCase() === 'select';
      }
      /*LWC compiler v8.24.0*/
    }
    lwc.registerDecorators(SlottedEventTarget, {
      track: {
        targetIsSelect: 1
      }
    });
    const __lwc_component_class_internal = lwc.registerComponent(SlottedEventTarget, {
      tmpl: _tmpl,
      sel: "integration-slotted-event-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-slotted-event-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
