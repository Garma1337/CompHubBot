/**
 * Returns an emote
 * @param name
 * @param id
 * @returns {string}
 */
function getEmote(name, id) {
  return `<:${name}:${id}>`;
}

module.exports = getEmote;
