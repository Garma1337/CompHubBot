const mongoose = require('mongoose');
const { consoles } = require('../consoles');
const { engineStyles } = require('../engine_styles');
const { hostGrades } = require('../host_grades');
const { natTypes } = require('../nat_types');
const { regions } = require('../regions');

const { Schema, model } = mongoose;

const keyMap = (k) => k.key;

const consoleKeys = consoles.map(keyMap);
const engineKeys = engineStyles.map(keyMap);
const hostGradeKeys = hostGrades.map(keyMap);
const natTypeNames = natTypes.map((n) => n.name);
const regionKeys = regions.map(keyMap);

const Player = new Schema({
  discordId: String,
  psn: String,
  flag: String,
  region: { type: String, enum: regionKeys.concat(null) },
  languages: [String],
  birthday: String,
  discordVc: Boolean,
  ps4Vc: Boolean,
  nat: { type: String, enum: natTypeNames.concat(null) },
  timeZone: String,
  favCharacter: String,
  favTrack: String,
  consoles: { type: [String], enum: consoleKeys.concat(null) },
  rankedName: String,
  favArena: String,
  color: String,
  engineStyle: { type: String, enum: engineKeys.concat(null) },
  oldPSNIDs: [String],
  oldRankedNames: [String],
  hostGrade: { type: String, enum: hostGradeKeys.concat(null) },
});

Player.methods = {
  getNatIcon() {
    // eslint-disable-next-line global-require
    const { client } = require('../../bot');

    let icon;

    if (!this.nat) {
      icon = client.getEmote('diamondYellow', '872049069336440842');
    } else {
      const natType = natTypes.find((n) => n.name === this.nat);
      switch (natType.key) {
        case 'nat1':
          icon = client.getEmote('diamondGreen', '872048667165614120');
          break;
        case 'nat2o':
          icon = client.getEmote('diamondBlue', '872049054828347422');
          break;
        case 'nat2c':
          icon = client.getEmote('diamondYellow', '872049069336440842');
          break;
        case 'nat3':
          icon = client.getEmote('diamondRed', '872049080233250837');
          break;
        default:
          icon = client.getEmote('diamondYellow', '872049069336440842');
          break;
      }
    }

    return icon;
  },
};

module.exports.Player = model('player', Player);
