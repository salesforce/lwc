(function (lwc) {
  'use strict';

  var _implicitStylesheets = undefined;

  function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
    var shadowSelector = token ? ("." + token) : "";
    return ["div", shadowSelector, " {color: blue;}"].join('');
    /*LWC compiler vX.X.X*/
  }
  stylesheet.$scoped$ = true;
  var _implicitScopedStylesheets = [stylesheet];

  const stc0 = {
    key: 0
  };
  function tmpl($api, $cmp, $slotset, $ctx) {
    const {h: api_element} = $api;
    return [api_element("div", stc0)];
    /*LWC compiler vX.X.X*/
  }
  var _tmpl = lwc.registerTemplate(tmpl);


  if (_implicitScopedStylesheets) {
    lwc.registerStylesheets(tmpl, "x-app_app", _implicitStylesheets, _implicitScopedStylesheets);
  }

  class App extends lwc.LightningElement {
    /*LWC compiler vX.X.X*/
  }

  var App$1 = lwc.registerComponent(App, {
    tmpl: _tmpl
  });

  const container = document.getElementById('main');
  const element = lwc.createElement('x-app', {
    is: App$1
  });
  container.appendChild(element);

})(LWC);
