const {
  MessageMenu,
  MessageMenuOption,
} = require('discord-buttons');
const {
  TYPE_FFA,
  TYPE_DUOS,
  TYPE_WAR,
} = require('../utils/discordDraft');
const { discordDraft } = require('../utils/discordDraft');

module.exports = {
  name: 'discord_draft',
  args: true,
  guildOnly: true,
  cooldown: 30,
  aliases: ['ddraft', 'better_draft'],
  usage: '@Player1 @Player2 ...',
  // eslint-disable-next-line consistent-return
  async execute(message) {
    if (message.mentions.length <= 0) {
      return message.channel.warn('You need to mention the players doing the draft.');
    }

    const settings = {
      [TYPE_FFA]: {
        mentions: 8,
        minBans: 0,
        maxBans: 8,
        minPicks: 8,
        maxPicks: 16,
        defaultBans: 0,
        defaultPicks: 8,
      },
      [TYPE_DUOS]: {
        mentions: 4,
        minBans: 0,
        maxBans: 8,
        minPicks: 4,
        maxPicks: 20,
        defaultBans: 0,
        defaultPicks: 8,
      },
      [TYPE_WAR]: {
        mentions: 2,
        minBans: 0,
        maxBans: 10,
        minPicks: 2,
        maxPicks: 20,
        defaultBans: 6,
        defaultPicks: 10,
      },
    };

    const users = [];
    let hasOwnMention = false;
    message.mentions.users.forEach((u) => {
      users.push(u);

      if (u.id === message.author.id) {
        hasOwnMention = true;
      }
    });

    if (!hasOwnMention && !message.member.isStaff() && !message.member.isSupporter()) {
      return message.channel.warn('You should be one of the players doing the draft.');
    }

    let type = 'invalid';
    switch (users.length) {
      case 2:
        type = TYPE_WAR;
        break;
      case 4:
        type = TYPE_DUOS;
        break;
      case 8:
        type = TYPE_FFA;
        break;
      default:
        break;
    }

    if (![TYPE_FFA, TYPE_DUOS, TYPE_WAR].includes(type)) {
      return message.channel.warn('You need to mention either 2, 4 or 8 players.');
    }

    const typeSettings = settings[type];
    const banMenu = new MessageMenu()
      .setID('select_bans')
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder('Choose ...');

    for (let x = typeSettings.minBans; x <= typeSettings.maxBans; x += users.length) {
      banMenu.addOption(
        new MessageMenuOption()
          .setLabel(x)
          .setValue(x),
      );
    }

    const pickMenu = new MessageMenu()
      .setID('select_picks')
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder('Choose ...');

    for (let x = typeSettings.minPicks; x <= typeSettings.maxPicks; x += users.length) {
      pickMenu.addOption(
        new MessageMenuOption()
          .setLabel(x)
          .setValue(x),
      );
    }

    const filter = (menu) => menu.clicker.user.id === message.author.id;
    const options = { max: 1, time: 30000, errors: ['time'] };

    const banMessage = await message.channel.info('Select the number of track bans.', [], [], [banMenu]);
    let banCount;

    try {
      const collectedBanOptions = await banMessage.awaitMenus(filter, options);
      const collectedBanOption = collectedBanOptions.first();
      banCount = collectedBanOption.values.shift();

      await collectedBanOption.reply.defer(true);
    } catch (e) {
      banCount = typeSettings.defaultBans;
    }

    banMessage.delete();

    const pickMessage = await message.channel.info('Select the number of track picks.', [], [], [pickMenu]);
    let pickCount;

    try {
      const collectedPickOptions = await pickMessage.awaitMenus(filter, options);
      const collectedPickOption = collectedPickOptions.first();
      pickCount = collectedPickOption.values.shift();

      await collectedPickOption.reply.defer(true);
    } catch (e) {
      pickCount = typeSettings.defaultPicks;
    }

    pickMessage.delete();

    await discordDraft(message.channel, users, type, banCount, pickCount, {
      enableDragonMines: true,
      enableHyperSpaceway: true,
      enableRetroStadium: true,
      enableSpyroCircuit: true,
      showDraftLog: true,
    });
  },
};
