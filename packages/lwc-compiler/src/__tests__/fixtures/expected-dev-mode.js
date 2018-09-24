define('x-class_and_template', ['lwc'], function (lwc) {

const stylesheet = undefined;

function tmpl($api, $cmp, $slotset, $ctx) {
  const {
    h: api_element
  } = $api;

  return [api_element("section", {
      key: 1
    }, [])];
}

if (stylesheet) {
    tmpl.hostToken = stylesheet.hostToken;
    tmpl.shadowToken = stylesheet.shadowToken;

    const style$$1 = document.createElement('style');
    style$$1.type = 'text/css';
    style$$1.dataset.token = stylesheet.shadowToken;
    style$$1.textContent = stylesheet.content;
    document.head.appendChild(style$$1);
}

const Test = 1;
class ClassAndTemplate extends lwc.LightningElement {
    constructor() {
        super();
        this.t = Test;
        this.counter = 0;
    }

    render() {
        return tmpl;
    }

}

return ClassAndTemplate;

});
