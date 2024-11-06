import { api, LightningElement } from 'lwc';

export default class extends LightningElement {
  @api staticPublic = 'child';
  @api dynamicPublic = 'child';

  staticPrivate = 'child';
  dynamicPrivate = 'child';
}
