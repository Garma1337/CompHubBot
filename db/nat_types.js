const getEmote = require('../utils/getEmote');

module.exports.natTypes = [
  {
    key: 'nat1',
    name: 'NAT 1',
    description: 'Choose if you are not behind a firewall.',
    emote: getEmote('diamondGreen', '872048667165614120'),
    default: false,
  },
  {
    key: 'nat2o',
    name: 'NAT 2 Open',
    description: 'Choose if you have portforwarding or UPNP enabled.',
    emote: getEmote('diamondBlue', '872049054828347422'),
    default: false,
  },
  {
    key: 'nat2c',
    name: 'NAT 2 Closed',
    description: 'Choose if you are unsure.',
    emote: getEmote('diamondYellow', '872049069336440842'),
    default: true,
  },
  {
    key: 'nat3',
    name: 'NAT 3',
    description: 'Choose if you use mobile hotspot internet.',
    emote: getEmote('diamondRed', '872049080233250837'),
    default: false,
  },
];
