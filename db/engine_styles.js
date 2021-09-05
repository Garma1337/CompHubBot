const getEmote = require('../utils/getEmote');

module.exports.engineStyles = [
  {
    key: 'turn',
    name: 'Turning',
    description: null,
    emote: getEmote('turn', '813098792886861874'),
    default: false,
    rankedEnabled: false,
  },
  {
    key: 'bal',
    name: 'Balanced',
    description: null,
    emote: getEmote('balanced', '813098792638218262'),
    default: false,
    rankedEnabled: false,
  },
  {
    key: 'accel',
    name: 'Acceleration',
    description: null,
    emote: getEmote('accel', '813098792622227468'),
    default: false,
    rankedEnabled: false,
  },
  {
    key: 'drift',
    name: 'Drift',
    description: null,
    emote: getEmote('drift', '813098792907440178'),
    default: false,
    rankedEnabled: false,
  },
  {
    key: 'speed',
    name: 'Speed',
    description: null,
    emote: getEmote('speed', '813098792907046922'),
    default: true,
    rankedEnabled: false,
  },
];
