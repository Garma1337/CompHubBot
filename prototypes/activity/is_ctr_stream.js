const { Activity } = require('discord.js');

/**
 * Returns true if an activity is a CTR (either OG or NF) stream
 * @returns {boolean}
 */
// eslint-disable-next-line func-names
Activity.prototype.isCTRStream = function () {
  return this.type === 'STREAMING' && this.state && this.state.toLowerCase().includes('crash team');
};
