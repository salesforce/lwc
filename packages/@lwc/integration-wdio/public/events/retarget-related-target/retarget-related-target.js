(function (lwc) {
    'use strict';

    const $fragment1$1 = lwc.parseFragment`<input class="shadow-element${0}"${2}>`;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {st: api_static_fragment} = $api;
      return [api_static_fragment($fragment1$1, 1)];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetToken = "lwc-74484v40a3r";
    tmpl$1.legacyStylesheetToken = "integration-child_child";
    lwc.freezeTemplate(tmpl$1);

    const __lwc_component_class_internal$1 = lwc.registerComponent(class extends lwc.LightningElement {
      /*LWC compiler v8.24.0*/
    }, {
      tmpl: _tmpl$1,
      sel: "integration-child",
      apiVersion: 66
    });

    const $fragment1 = lwc.parseFragment`<span class="related-target-class-name${0}"${2}>${"t1"}</span>`;
    const stc0 = {
      classMap: {
        "first": true
      },
      key: 1
    };
    const stc1 = {
      classMap: {
        "second": true
      },
      key: 2
    };
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {b: api_bind, c: api_custom_element, h: api_element, d: api_dynamic_text, sp: api_static_part, st: api_static_fragment} = $api;
      const {_m0} = $ctx;
      return [api_element("div", {
        key: 0,
        on: _m0 || ($ctx._m0 = {
          "mouseover": api_bind($cmp.handleMouseOver)
        })
      }, [api_custom_element("integration-child", __lwc_component_class_internal$1, stc0), api_custom_element("integration-child", __lwc_component_class_internal$1, stc1)]), api_static_fragment($fragment1, 4, [api_static_part(1, null, api_dynamic_text($cmp.relatedTargetClassNames))])];
      /*LWC compiler v8.24.0*/
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "lwc-1s1e18lgnvp";
    tmpl.legacyStylesheetToken = "integration-retarget-related-target_retarget-related-target";
    lwc.freezeTemplate(tmpl);

    const __lwc_component_class_internal = lwc.registerComponent(lwc.registerDecorators(class extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this._relatedTargetClassNames = [];
      }
      get relatedTargetClassNames() {
        return this._relatedTargetClassNames.map(className => className || 'undefined').join(', ');
      }
      handleMouseOver(event) {
        this._relatedTargetClassNames.push(event.relatedTarget && event.relatedTarget.className);
      }
      /*LWC compiler v8.24.0*/
    }, {
      track: {
        _relatedTargetClassNames: 1
      }
    }), {
      tmpl: _tmpl,
      sel: "integration-retarget-related-target",
      apiVersion: 66
    });

    var element = lwc.createElement('integration-retarget-related-target', {
                is: __lwc_component_class_internal
            });

            document.body.appendChild(element);

})(LWC);
