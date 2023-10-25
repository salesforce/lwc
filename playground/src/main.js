// import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
// import App from 'example/adapterApp';
import App from 'slot/app';

lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE = true
const elm = createElement('slot-app', { is: App });
document.body.appendChild(elm);
