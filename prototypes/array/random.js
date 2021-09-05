/**
 * Returns a random array value
 * @returns {*}
 */
// eslint-disable-next-line no-extend-native,func-names
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
