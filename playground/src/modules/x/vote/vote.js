import { LightningElement, api } from 'lwc';

export default class App extends LightningElement {
  @api count;
  @api upvote;
  @api downvote;
}
