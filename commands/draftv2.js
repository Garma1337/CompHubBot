const createDraftv2 = require('../utils/createDraftv2');

module.exports = {
  name: 'draft2',
  description: `Generate draft links using the new draft tool
\`!draft2 [type] @CaptainA @CaptainB [bans] [picks] [timeout]\``,
  guildOnly: true,
  cooldown: 15,
  aliases: ['new_draft', 'draftv2'],
  // eslint-disable-next-line consistent-return
  execute(message) {
    const wrongSyntax = 'Wrong command usage. Try `!draft2 [type] @CaptainA @CaptainB [bans] [picks] [timeout]`.';

    const params = message.content.split(' ');
    params.shift(); // remove command

    const mode = params[0] === 'battle' ? 2 : 1;
    const { mentions } = message;
    const mentionedUsers = mentions.users.array();
    const bans = params[3] || (params[0] === 'battle' ? 1 : 3);
    const picks = params[4] || (params[0] === 'battle' ? 3 : 5);
    const timeout = params[5];

    if (params.length < 3 || mentionedUsers.length < 2) {
      return message.channel.warn(wrongSyntax);
    }

    // eslint-disable-next-line max-len
    if (!message.member.isStaff() && !message.member.isSupporter() && !mentionedUsers.map((m) => m.id).includes(message.author.id)) {
      return message.channel.warn('You should be one of the players doing the draft.');
    }

    createDraftv2(message.channel, mode, bans, picks, timeout, mentions);
  },
};
