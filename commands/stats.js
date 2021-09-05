const moment = require('moment');
const { Player } = require('../db/models/player');
const { regions } = require('../db/regions');
const { consoles } = require('../db/consoles');

/**
 * Sorts an object based on its keys
 * @param object
 * @returns {{}}
 */
function sortEntries(object) {
  return Object.fromEntries(Object.entries(object).sort(([, a], [, b]) => b - a));
}

module.exports = {
  name: 'stats',
  description: 'See various statistics',
  guildOnly: true,
  aliases: ['statistics'],
  cooldown: 15,
  // eslint-disable-next-line consistent-return
  async execute(message, args) {
    const types = [
      'regions',
      'countries',
      'languages',
      'birthdays',
      'voice_chat',
      'nat_types',
      'time_zones',
      'characters',
      'tracks',
      'arenas',
      'consoles',
    ];

    const type = args[0];
    if (!types.includes(type)) {
      return message.channel.warn(`Invalid type. Here is a list of all available statistics types:\n
\`\`\`${types.join('\n')}\`\`\``);
    }

    const players = await Player.find();
    const elements = [];
    let embedHeading;

    switch (type) {
      case 'regions':
        embedHeading = 'Regions';
        // eslint-disable-next-line no-case-declarations
        let playerRegions = {};

        players.forEach((p) => {
          if (p.region) {
            if (!playerRegions[p.region]) {
              playerRegions[p.region] = 1;
            } else {
              playerRegions[p.region] += 1;
            }
          }
        });

        playerRegions = sortEntries(playerRegions);

        // eslint-disable-next-line guard-for-in
        for (const i in playerRegions) {
          const region = regions.find((r) => r.key === i);

          elements.push(`${region.name} - ${playerRegions[i]} players`);
        }
        break;

      case 'countries':
        embedHeading = 'Countries';
        // eslint-disable-next-line no-case-declarations
        let countries = {};

        players.forEach((p) => {
          if (p.flag && p.flag !== '🇺🇳') {
            if (!countries[p.flag]) {
              countries[p.flag] = 1;
            } else {
              countries[p.flag] += 1;
            }
          }
        });

        countries = sortEntries(countries);

        // eslint-disable-next-line guard-for-in
        for (const i in countries) {
          elements.push(`${i} - ${countries[i]} players`);
        }

        break;

      case 'languages':
        embedHeading = 'Most spoken languages';
        // eslint-disable-next-line no-case-declarations
        let languages = {};

        players.forEach((p) => {
          p.languages.forEach((l) => {
            if (!languages[l]) {
              languages[l] = 1;
            } else {
              languages[l] += 1;
            }
          });
        });

        languages = sortEntries(languages);

        // eslint-disable-next-line guard-for-in
        for (const i in languages) {
          elements.push(`${i} - ${languages[i]} players`);
        }

        break;

      case 'birthdays':
        embedHeading = 'Most common birthdays';
        // eslint-disable-next-line no-case-declarations
        let birthdays = {};

        players.forEach((p) => {
          if (p.birthday) {
            const birthday = moment(p.birthday);

            if (birthday.isValid()) {
              const year = Number(birthday.year());

              if (!birthdays[year]) {
                birthdays[year] = 1;
              } else {
                birthdays[year] += 1;
              }
            }
          }
        });

        birthdays = sortEntries(birthdays);

        // eslint-disable-next-line guard-for-in
        for (const i in birthdays) {
          elements.push(`${i} - ${birthdays[i]} players`);
        }
        break;

      case 'voice_chat':
        embedHeading = 'Most used voice chats';
        // eslint-disable-next-line no-case-declarations
        let discordVc = 0;
        // eslint-disable-next-line no-case-declarations
        let ps4Vc = 0;

        players.forEach((p) => {
          if (p.discordVc) {
            discordVc += 1;
          }

          if (p.ps4Vc) {
            ps4Vc += 1;
          }
        });

        elements.push(`Discord - ${discordVc} players`);
        elements.push(`PS4 - ${ps4Vc} players`);
        break;

      case 'nat_types':
        embedHeading = 'Most common NAT types';
        // eslint-disable-next-line no-case-declarations
        let natTypes = {};

        players.forEach((p) => {
          if (p.nat) {
            if (!natTypes[p.nat]) {
              natTypes[p.nat] = 1;
            } else {
              natTypes[p.nat] += 1;
            }
          }
        });

        natTypes = sortEntries(natTypes);

        // eslint-disable-next-line guard-for-in
        for (const i in natTypes) {
          elements.push(`${i} - ${natTypes[i]} players`);
        }
        break;

      case 'time_zones':
        embedHeading = 'Most common time zones';
        // eslint-disable-next-line no-case-declarations
        let timeZones = {};

        players.forEach((p) => {
          if (p.timeZone) {
            if (!timeZones[p.timeZone]) {
              timeZones[p.timeZone] = 1;
            } else {
              timeZones[p.timeZone] += 1;
            }
          }
        });

        timeZones = sortEntries(timeZones);

        // eslint-disable-next-line guard-for-in
        for (const i in timeZones) {
          elements.push(`${i} - ${timeZones[i]} players`);
        }
        break;

      case 'characters':
        embedHeading = 'Most favorited Characters';
        // eslint-disable-next-line no-case-declarations
        let characters = {};

        players.forEach((p) => {
          if (p.favCharacter) {
            if (!characters[p.favCharacter]) {
              characters[p.favCharacter] = 1;
            } else {
              characters[p.favCharacter] += 1;
            }
          }
        });

        characters = sortEntries(characters);

        // eslint-disable-next-line guard-for-in
        for (const i in characters) {
          elements.push(`${i} - ${characters[i]} players`);
        }
        break;

      case 'tracks':
        embedHeading = 'Most favorited tracks';
        // eslint-disable-next-line no-case-declarations
        let tracks = {};

        players.forEach((p) => {
          if (p.favTrack) {
            if (!tracks[p.favTrack]) {
              tracks[p.favTrack] = 1;
            } else {
              tracks[p.favTrack] += 1;
            }
          }
        });

        tracks = sortEntries(tracks);

        // eslint-disable-next-line guard-for-in
        for (const i in tracks) {
          elements.push(`${i} - ${tracks[i]} players`);
        }
        break;

      case 'arenas':
        embedHeading = 'Most favorited arenas';
        // eslint-disable-next-line no-case-declarations
        let arenas = {};

        players.forEach((p) => {
          if (p.favArena) {
            if (!arenas[p.favArena]) {
              arenas[p.favArena] = 1;
            } else {
              arenas[p.favArena] += 1;
            }
          }
        });

        arenas = sortEntries(arenas);

        // eslint-disable-next-line guard-for-in
        for (const i in arenas) {
          elements.push(`${i} - ${arenas[i]} players`);
        }
        break;

      case 'consoles':
        embedHeading = 'Most used consoles';
        // eslint-disable-next-line no-case-declarations
        let playerConsoles = {};

        players.forEach((p) => {
          p.consoles.forEach((console) => {
            if (!playerConsoles[console]) {
              playerConsoles[console] = 1;
            } else {
              playerConsoles[console] += 1;
            }
          });
        });

        playerConsoles = sortEntries(playerConsoles);

        // eslint-disable-next-line guard-for-in
        for (const i in playerConsoles) {
          const console = consoles.find((c) => c.key === i);

          elements.push(`${console.name} - ${playerConsoles[i]} players`);
        }
        break;
      default:
        break;
    }

    message.channel.sendPageableContent(message.author.id, {
      outputType: 'embed',
      elements,
      elementsPerPage: 20,
      embedOptions: { heading: embedHeading },
      buttonCollectorOptions: { time: 3600000 },
    });
  },
};
