const util = require('util');
const config = require('../config');

/**
 * Cleans code from illegal characters
 * @param text
 * @returns string
 */
const clean = (text) => {
  if (typeof (text) === 'string') {
    return text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
  }

  return text;
};

module.exports = {
  name: 'exec',
  guildOnly: true,
  execute(message, args) {
    if (message.author.id !== config.owner) {
      return message.channel.warn('You cannot use this command.');
    }

    if (args.length <= 0) {
      return message.channel.warn('Please enter the code you want to run.');
    }

    const code = args.join(' ');
    try {
      // eslint-disable-next-line no-eval
      let evaled = eval(code);

      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled);
      }

      let content = 'Code:';
      content += `\`\`\`js\n${code}\`\`\``;
      content += '\nResult:';
      content += `\`\`\`js\n${clean(evaled)}\`\`\``;

      return message.channel.success(content);
    } catch (err) {
      let content = 'Code:';
      content += `\`\`\`js\n${code}\`\`\``;
      content += '\nError:';
      content += `\`\`\`js\n${clean(err)}\`\`\``;

      return message.channel.error(content);
    }
  },
};
