const { Player } = require('../db/models/player');
const { voiceChats } = require('../db/voice_chats');

module.exports = {
  name: 'set_voice_chat',
  description: 'Set your voice chat options.',
  guildOnly: true,
  aliases: ['set_vc'],
  cooldown: 10,
  execute(message, args) {
    if (args.length > 0 && args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.discordVc = null;
        player.ps4Vc = null;
        player.save().then(() => {
          message.channel.success('Your voice chat options have been unset.');
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      return;
    }

    let user;

    if (message.member.isStaff() && args.length === 1) {
      user = message.mentions.users.first();
    } else {
      user = message.author;
    }

    message.channel.awaitMenuChoice('Please select your voice chat option(s).', message.author.id, voiceChats, voiceChats.length).then((selection) => {
      Player.findOne({ discordId: user.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = user.id;
        }

        player.discordVc = false;
        player.ps4Vc = false;

        const voiceChatOptions = [];
        if (selection.includes('discord')) {
          player.discordVc = true;
          voiceChatOptions.push('Discord');
        }

        if (selection.includes('ps4')) {
          player.ps4Vc = true;
          voiceChatOptions.push('PS4');
        }

        player.save().then(() => {
          message.channel.success(`Your voice chat options have been set to \`${voiceChatOptions.join(', ')}\`.`);
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });
    });
  },
};
