/**
 * Shuffles an array
 */
// eslint-disable-next-line no-extend-native,func-names
Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }

  return this;
};
