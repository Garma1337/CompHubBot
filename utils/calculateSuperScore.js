const {
  RACE_ITEMS_FFA,
  RACE_ITEMS_DUOS,
  RACE_ITEMLESS_FFA,
  BATTLE_FFA,
} = require('../db/models/lobby');

/**
 * Returns a player's superscore
 * @param rank
 * @param baseRank
 * @returns {number}
 */
function calculateSuperScore(rank, baseRank = 500) {
  let itemSolosRank = rank[RACE_ITEMS_FFA].rank || baseRank;
  let itemTeamsRank = rank[RACE_ITEMS_DUOS].rank || baseRank;
  let itemlessRank = rank[RACE_ITEMLESS_FFA].rank || baseRank;
  let battleRank = rank[BATTLE_FFA].rank || baseRank;

  itemSolosRank = parseInt(itemSolosRank, 10);
  itemTeamsRank = parseInt(itemTeamsRank, 10);
  itemlessRank = parseInt(itemlessRank, 10);
  battleRank = parseInt(battleRank, 10);

  // eslint-disable-next-line max-len
  return Math.ceil((itemSolosRank + itemTeamsRank + itemlessRank + battleRank) / 4);
}

module.exports = calculateSuperScore;
