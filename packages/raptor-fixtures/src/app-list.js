import { createElement } from 'engine';
import App from 'simple-list';

const element = createElement('simple-list', { is: App });
element.header = 'super awesome demo';
element.label = 're-shuffle';
element.min = 30;

document.body.appendChild(element);
