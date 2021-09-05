const drawTable = require('../utils/drawTable');

module.exports = {
  name: 'table',
  description: 'Generate score table. https://gb2.hlorenzi.com',
  cooldown: 10,
  guildOnly: true,
  aliases: ['t'],
  // eslint-disable-next-line consistent-return
  execute(message) {
    const rows = message.content.split('\n');
    rows.shift();

    if (!rows.length) {
      return message.channel.warn('Empty table.');
    }

    message.channel.info('Generating the table...').then((m) => {
      drawTable(rows.join('\n')).then((attachment) => {
        message.channel.send(message.author, { files: [attachment] }).then(() => {
          message.delete();
          m.delete();
          // eslint-disable-next-line no-console
        }).catch(console.error);
      });
    });
  },
};
