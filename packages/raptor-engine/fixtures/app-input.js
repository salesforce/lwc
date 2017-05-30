// bootstrap process for the app
import { createElement } from 'engine';
import CustomInput from 'custom-input';

const container = document.getElementById('container');
const element = createElement('custom-input', { is: CustomInput });
container.appendChild(element);
