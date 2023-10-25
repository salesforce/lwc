const entries = [];
const cbs = [];

export const logger = {
  log(...args) {
    entries.push(args);
    cbs.forEach(fn => fn(logger.getText()));
  },

  onEntry(fn) {
    cbs.push(fn);
  },

  getText() {
    return entries.map(entry => entry.join(" "));
  }
}