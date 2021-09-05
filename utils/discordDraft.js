const config = require('../config');

const TRACK_DRAGON_MINES = 'Dragon Mines';
const TRACK_HYPER_SPACEWAY = 'Hyper Spaceway';
const TRACK_RETRO_STADIUM = 'Retro Stadium';
const TRACK_SPYRO_CIRCUIT = 'Spyro Circuit';

const TYPE_FFA = 'ffa';
const TYPE_DUOS = 'duos';
const TYPE_WAR = 'war';
const PHASE_BAN = 'ban';
const PHASE_PICK = 'pick';

module.exports.TYPE_FFA = TYPE_FFA;
module.exports.TYPE_DUOS = TYPE_DUOS;
module.exports.TYPE_WAR = TYPE_WAR;
module.exports.PHASE_BAN = PHASE_BAN;
module.exports.PHASE_PICK = PHASE_PICK;

const trackTypes = [
  {
    key: 'ctr',
    name: 'CTR Tracks',
  },
  {
    key: 'cnk',
    name: 'CNK Tracks',
  },
  {
    key: 'bonus',
    name: 'Bonus Tracks',
  },
];

/**
 * Asks the user to select a track
 * @param channel
 * @param user
 * @param excludedTracks
 * @param phase
 * @param draftOptions
 * @returns {Promise<string>}
 */
async function getTrackSelection(channel, user, excludedTracks, phase, draftOptions) {
  let action;
  if (phase === PHASE_BAN) {
    action = 'banning';
  } else {
    action = 'picking';
  }

  const alertMessage = await channel.info(`<@!${user.id}> is now ${action} a track!`);
  let trackType;

  try {
    trackType = await channel.awaitMenuChoice('Please select a track pool.', user.id, trackTypes, 1);
  } catch (e) {
    trackType = trackTypes.map((t) => t.key).random();
  }

  // eslint-disable-next-line global-require,import/no-dynamic-require
  const tracks = require(`../db/pools/${trackType}.js`);

  const trackList = tracks[0];
  trackList.forEach((t, i) => {
    if (
      (t === TRACK_DRAGON_MINES && !draftOptions.enableDragonMines)
      || (t === TRACK_HYPER_SPACEWAY && !draftOptions.enableHyperSpaceway)
      || (t === TRACK_SPYRO_CIRCUIT && !draftOptions.enableSpyroCircuit)
      || (t === TRACK_RETRO_STADIUM && !draftOptions.enableRetroStadium)
    ) {
      trackList.splice(i, 1);
    }
  });

  const trackOptions = [];

  trackList.forEach((tr) => {
    if (!excludedTracks.includes(tr)) {
      trackOptions.push({
        key: tr,
        name: tr,
      });
    }
  });

  let track;

  try {
    track = channel.awaitMenuChoice('Please select a track.', user.id, trackOptions, 1);
  } catch (e) {
    track = trackList.random();
  }

  alertMessage.delete();

  return track;
}

/**
 * Updates the log message
 * @param message
 * @param bannedTracks
 * @param pickedTracks
 * @returns {Promise<void>}
 */
async function updateLogMessage(message, bannedTracks, pickedTracks) {
  const content = [];

  bannedTracks.forEach((b) => {
    content.push(`<@!${b.user.id}> banned ${b.track}!`);
  });

  pickedTracks.forEach((p) => {
    content.push(`<@!${p.user.id}> picked ${p.track}!`);
  });

  message.edit(content.join('\n'));
}

/**
 * Discord based drafting
 * @param channel
 * @param mentions
 * @param type
 * @param bans
 * @param picks
 * @param options
 * @returns {Promise<*>}
 */
// eslint-disable-next-line consistent-return
async function discordDraft(channel, mentions, type, bans, picks, options) {
  options.enableDragonMines = options.enableDragonMines || false;
  options.enableHyperSpaceway = options.enableHyperSpaceway || false;
  options.enableRetroStadium = options.enableRetroStadium || false;
  options.enableSpyroCircuit = options.enableSpyroCircuit || false;
  options.showDraftLog = options.showDraftLog || false;

  /* Make sure that ban and pick order have the same initial value */
  const shuffledPlayers = mentions.shuffle().reverse();

  let banPlayerList = [];
  let pickPlayerList = [];

  if ([TYPE_FFA, TYPE_DUOS].includes(type)) {
    for (let i = 1; i <= (bans / mentions.length); i += 1) {
      banPlayerList = banPlayerList.concat(shuffledPlayers.reverse());
    }

    for (let i = 1; i <= (picks / mentions.length); i += 1) {
      pickPlayerList = pickPlayerList.concat(shuffledPlayers.reverse());
    }
  } else {
    banPlayerList = [];
    pickPlayerList = [];

    for (let i = 0; i < bans; i += 1) {
      if (i % 2 === 0) {
        banPlayerList.push(shuffledPlayers[0]);
      } else {
        banPlayerList.push(shuffledPlayers[1]);
      }
    }

    for (let i = 1; i <= picks; i += 1) {
      if ([0, 1].includes(i % 4)) {
        pickPlayerList.push(shuffledPlayers[0]);
      } else {
        pickPlayerList.push(shuffledPlayers[1]);
      }
    }
  }

  const bannedTracks = [];
  const pickedTracks = [];
  const mapFunction = (t) => t.track;

  let logMessage;
  if (options.showDraftLog) {
    logMessage = await channel.send('Waiting for draft ...');
  }

  if (banPlayerList.length > 0) {
    for (let x = 0; x < banPlayerList.length; x += 1) {
      // eslint-disable-next-line max-len
      const track = await getTrackSelection(
        channel,
        banPlayerList[x],
        bannedTracks.map(mapFunction),
        PHASE_BAN,
        options,
      );

      bannedTracks.push({
        track,
        user: banPlayerList[x],
      });

      if (options.showDraftLog) {
        await updateLogMessage(logMessage, bannedTracks, []);
      }
    }
  }

  if (pickPlayerList.length > 0) {
    for (let x = 0; x < pickPlayerList.length; x += 1) {
      // eslint-disable-next-line max-len
      const track = await getTrackSelection(
        channel,
        pickPlayerList[x],
        bannedTracks.map(mapFunction).concat(pickedTracks.map(mapFunction)),
        PHASE_PICK,
        options,
      );

      pickedTracks.push({
        track,
        user: pickPlayerList[x],
      });

      if (options.showDraftLog) {
        await updateLogMessage(logMessage, bannedTracks, pickedTracks);
      }
    }
  }

  const embed = {
    color: config.default_embed_color,
    description: `The players doing the draft were ${shuffledPlayers.join(', ')}.`,
    author: {
      name: 'Draft',
    },
    fields: [
      {
        name: 'Banned Tracks',
        value: (bannedTracks.length > 0 ? bannedTracks.map((b, i) => `${i + 1}. ~~${b.track}~~ (<@!${b.user.id}>)`).join('\n') : '-'),
        inline: true,
      },
      {
        name: 'Picked Tracks',
        value: (pickedTracks.length > 0 ? pickedTracks.map((p, i) => `${i + 1}. ${p.track} (<@!${p.user.id}>)`).join('\n') : '-'),
        inline: true,
      },
    ],
  };

  if (options.showDraftLog) {
    logMessage.delete();
  }

  channel.send({ embed });
}

module.exports.discordDraft = discordDraft;
