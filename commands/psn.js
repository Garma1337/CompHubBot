const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const config = require('../config');

module.exports = {
  name: 'psn',
  guildOnly: true,
  args: true,
  aliases: ['psn_profile'],
  cooldown: 60,
  async execute(message, args) {
    const userBaseUrl = `${config.exophase.site_base_url}${config.exophase.environment}/user/`;
    const gameResponse = await axios.get(`${config.exophase.api_base_url}archive/games?q=${config.exophase.game}`);

    // eslint-disable-next-line max-len
    const game = gameResponse.data.games.list.find((g) => g.environment_slug === config.exophase.environment);

    const psn = args[0];
    let totalPlayTime = null;
    let country = null;
    let gamesOwned = null;
    let finishedGames = null;
    let playingSince = null;
    let playtime = null;
    let lastPlayed = null;
    const trophies = {
      has: null,
      max: null,
    };

    let profileResponse;

    try {
      profileResponse = await axios.get(userBaseUrl + psn);
    } catch (e) {
      return message.channel.warn(`${psn} either does not exist or is not on expohase.`);
    }

    const $ = cheerio.load(profileResponse.data);

    const headerElement = $('section.section-profile-header');
    const avatarUrl = headerElement.find('img').attr('src');

    totalPlayTime = headerElement
      .find('span[data-tippy-content="Cumulative gameplay hours"]')
      .text()
      .trim()
      .replace(',', '.');

    const countryElement = headerElement.find('span.country-ranking > img');
    if (countryElement.length <= 0) {
      country = null;
    } else {
      country = countryElement
        .attr('src')
        .split('/')
        .pop()
        .split('.')
        .shift();
    }

    gamesOwned = headerElement.find('span[data-tippy-content="Games owned"]').text().trim();
    finishedGames = headerElement.find('span[data-tippy-content="Completed games"]').text().trim() || 0;

    const profileOutput = [
      `**PSN**: ${psn}`,
      `**Country**: ${country !== null ? `:flag_${country}:` : ':united_nations:'}`,
      `**Games**: ${gamesOwned} (${finishedGames} finished)`,
      `**Time played**: ${totalPlayTime}`,
    ];

    const gameContainerElement = $(`li[data-gameid="${game.master_id}"]`);
    if (!gameContainerElement) {
      return message.channel.warn(`The player ${psn} has not played ${config.exophase.game}.`);
    }

    const gameInfoContainerElement = gameContainerElement.find('div.game-info .box a');
    const href = gameInfoContainerElement.attr('href');
    if (!href) {
      return message.channel.warn('The user data could not be fetched.');
    }

    const userId = href.split('#').pop();
    const trophiesResponse = await axios.get(`${config.exophase.api_base_url}player/${userId}/game/${game.master_id}/earned`);

    // eslint-disable-next-line max-len
    const firstTrophy = trophiesResponse.data.list.sort((a, b) => a.timestamp - b.timestamp).shift();
    playingSince = firstTrophy.timestamp;

    playtime = parseInt(String(gameContainerElement.data('playtime')), 10);
    lastPlayed = gameContainerElement.find('div.lastplayed').text();

    const trophiesElement = gameContainerElement.find('div.game-progress > div:first-child > div');
    const text = trophiesElement
      .text()
      .split(' ')
      .shift()
      .replace('"', '')
      .split('/');

    trophies.has = text[0];
    trophies.max = text[1];

    const a = moment(moment().unix() * 1000);
    const b = moment(playingSince * 1000);
    const daysPlayed = moment.duration(a.diff(b)).asDays();
    const averagePlaytime = (playtime / daysPlayed).toFixed(2);

    const gameOutput = [
      `**Time played**: ${Intl.NumberFormat('de-DE').format(playtime)} hours`,
      `**Last played**: ${lastPlayed}`,
      `**Playing since**: ${moment.unix(playingSince).format('MMM D, YYYY')}`,
      `**Average playtime**: ${averagePlaytime} hours daily`,
      `**Trophies**: ${trophies.has} / ${trophies.max}`,
    ];

    const embed = {
      color: config.default_embed_color,
      thumbnail: {
        url: avatarUrl,
      },
      author: {
        name: `${psn}'s PSN profile`,
        icon_url: avatarUrl,
      },
      description: `The displayed data may not be super accurate.\nCheck out the full profile on [Exophase](https://www.exophase.com/psn/user/${psn}).`,
      fields: [
        {
          name: 'Profile',
          value: profileOutput.join('\n'),
          inline: true,
        },
        {
          name: 'Crash Team Racing',
          value: gameOutput.join('\n'),
          inline: true,
        },
      ],
      timestamp: new Date(),
    };

    return message.channel.send({ embed });
  },
};
