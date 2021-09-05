const { TextChannel } = require('discord.js');
const { parse, parsers } = require('../../utils/signups_parsers');

/**
 * Parses signups of a channel
 * @param doc
 * @returns {Promise<{hosts: number, count: number, rows: *[]}>}
 */
// eslint-disable-next-line func-names
TextChannel.prototype.parseSignups = function (doc) {
  const parser = parsers[doc.parser];

  const SEPARATOR = ',';
  let firstRow;
  const out = [];

  return this.fetchMessages(500).then((messages) => {
    let count = 0;
    let hosts = 0;

    const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    sortedMessages.forEach((m, index) => {
      if (index === 0 || m.type === 'PINS_ADD' || m.author.bot) {
        return;
      }

      count += 1;

      const data = parse(m, parser.fields);

      if (data.host) hosts += 1;

      data.valid = !data.errors.length;
      delete data.errors;

      if (!firstRow) {
        firstRow = ['#', ...Object.keys(data)];
      }

      const row = [count, ...Object.values(data)];
      out.push(row.join(SEPARATOR));

      data.createdAt = m.createdTimestamp;
    });

    out.unshift(firstRow);

    return { count, hosts, rows: out };
  });
};
