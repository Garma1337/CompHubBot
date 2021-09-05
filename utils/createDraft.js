const axios = require('axios');

/**
 * Creates a draft between 2 teams
 * @param channel
 * @param draftMode
 * @param teams
 * @param captains
 */
function createDraft(channel, draftMode, teams, captains) {
  channel.info('Connecting to `draft.crashteamranking.com`...').then((m) => {
    const teamB = teams[1];
    const teamA = teams[0];

    axios.post('https://draft.crashteamranking.com/drafttool.php', null, {
      params: {
        msgID: 0,
        teamA,
        teamB,
        draftMode,
      },
    }).then((r) => {
      const { ID, hashA, hashB } = r.data;
      const lobbyLink = 'https://draft.crashteamranking.com/lobby.php?id=';
      const specLink = lobbyLink + ID;
      const teamALink = `${specLink}&hash=${hashA}`;
      const teamBLink = `${specLink}&hash=${hashB}`;

      const captainA = captains[0];
      const captainB = captains[1];

      const captainAPromise = captainA.createDM()
        .then((dm) => dm.send(`Draft link for a war with ${teamB}:\n${teamALink}`))
        .catch(() => channel.warn(`Couldn't message ${captainA}.\n${teamA} link:\n${teamALink}`, 'error'));

      const captainBPromise = captainB.createDM()
        .then((dm) => dm.send(`Draft link for a war with ${teamB}:\n${teamBLink}`))
        .catch(() => channel.warn(`Couldn't message ${captainB}.\n${teamB} link:\n${teamBLink}`, 'error'));

      Promise.all([captainAPromise, captainBPromise]).then(() => {
        m.delete();

        channel.success(`I've messaged both captains: ${captains.join(', ')} with team links.
Spectator link: <${specLink}>`);
      });
    }).catch(() => {
      channel.error('Couldn\'t connect to `draft.crashteamranking.com\nTry again later.`');
    });
  });
}

module.exports = createDraft;
