const mongoose = require('mongoose');
const {
  RACE_ITEMS_FFA,
  RACE_ITEMS_DUOS,
  RACE_ITEMS_3V3,
  RACE_ITEMS_4V4,
  RACE_ITEMLESS_1V1,
  RACE_ITEMLESS_FFA,
  RACE_ITEMLESS_DUOS,
  RACE_ITEMLESS_3V3,
  RACE_ITEMLESS_4V4,
  BATTLE_1V1,
  BATTLE_FFA,
  BATTLE_DUOS,
  BATTLE_3V3,
  BATTLE_4V4,
  INSTA_DUOS,
  INSTA_3V3,
  INSTA_4V4,
} = require('./lobby');

const { Schema, model } = mongoose;

const Rank = new Schema({
  name: String,
  [RACE_ITEMS_FFA]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMS_DUOS]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMS_3V3]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMS_4V4]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMLESS_1V1]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMLESS_FFA]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMLESS_DUOS]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMLESS_3V3]: { rank: Number, position: Number, lastActivity: Number },
  [RACE_ITEMLESS_4V4]: { rank: Number, position: Number, lastActivity: Number },
  [BATTLE_1V1]: { rank: Number, position: Number, lastActivity: Number },
  [BATTLE_FFA]: { rank: Number, position: Number, lastActivity: Number },
  [BATTLE_DUOS]: { rank: Number, position: Number, lastActivity: Number },
  [BATTLE_3V3]: { rank: Number, position: Number, lastActivity: Number },
  [BATTLE_4V4]: { rank: Number, position: Number, lastActivity: Number },
  [INSTA_DUOS]: { rank: Number, position: Number, lastActivity: Number },
  [INSTA_3V3]: { rank: Number, position: Number, lastActivity: Number },
  [INSTA_4V4]: { rank: Number, position: Number, lastActivity: Number },
});

module.exports.Rank = model('rank', Rank);
