const { Config } = require('../db/models/config');

module.exports = {
  name: 'config',
  description: 'Edit bot config.',
  guildOnly: true,
  permissions: ['MANAGE_ROLES'],
  aliases: ['command'],
  execute(message, args) {
    if (args.length === 0) {
      Config.find({ editable: { $ne: false } }).then((docs) => {
        if (docs.length) {
          const config = docs.map((doc) => `\`${doc.name}\``).join('\n');
          message.channel.info(`Config variables:\n${config}`);
        }
      });

      return;
    }

    const action = args[0];

    const SHOW = 'show';
    const EDIT = 'edit';
    const actions = [SHOW, EDIT];

    if (!actions.includes(action)) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn(`Wrong command action. Allowed actions: ${actions}`);
    }

    if (args.length < 2) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn('Wrong amount of arguments. Example: `!config edit name`');
    }

    const configName = args[1];

    if (action === SHOW) {
      Config.findOne({ name: configName, editable: { $ne: false } }).then((config) => {
        if (config) {
          message.channel.info(`The value of \`${configName}\` variable is:\n${config.value}`);
        } else {
          message.channel.warn('There is no config variable with that name.');
        }
      });
    } else {
      Config.findOne({ name: configName, editable: { $ne: false } }).then((config) => {
        if (config) {
          message.channel.send(`Send a new value for \`${configName}\` variable. Waiting 1 minute.
Type \`cancel\` to cancel.`).then(() => {
            message.channel
              .awaitMessages((m) => m.author.id === message.author.id, { max: 1, time: 60000, errors: ['time'] })
              .then((collected) => {
                const { content } = collected.first();
                if (content.toLowerCase() === 'cancel') {
                  throw new Error('cancel');
                }

                // eslint-disable-next-line no-param-reassign
                config.value = content;
                config.save().then(() => {
                  message.channel.success('Config variable edited.');
                });
              }).catch(() => message.channel.error('Command cancelled.'));
          });
        } else {
          message.channel.warn('There is no config variable with that name.');
        }
      });
    }
  },
};
