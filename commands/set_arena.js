const fs = require('fs');
const config = require('../config');
const { Player } = require('../db/models/player');

module.exports = {
  name: 'set_arena',
  usage: '[arena]',
  description: 'Set your favorite arena.',
  guildOnly: true,
  cooldown: 10,
  execute(message, args) {
    // eslint-disable-next-line consistent-return
    fs.readFile(config.files.battle_arenas_file, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      const arenas = data.trim().split('\n');

      if (args.length < 1) {
        message.channel.warn('You need to specify an arena.');
        return message.channel.send({
          embed: {
            color: config.default_embed_color,
            author: {
              name: 'Select your favorite arena!',
            },
            fields: [
              {
                name: 'Arenas',
                value: arenas.join('\n'),
                inline: true,
              },
            ],
          },
        });
      }

      const input = args.join(' ').trim();
      const arena = arenas.find((t) => t.toLowerCase() === input.toLowerCase());

      if (!arena) {
        return message.channel.warn(`The arena "${input}" doesn't exist.`);
      }

      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.favArena = arena;
        player.save().then(() => {
          message.channel.success(`Your favorite arena has been set to "${arena}".`);
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
