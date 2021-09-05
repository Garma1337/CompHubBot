const { Command } = require('../db/models/command');

module.exports = {
  name: 'commands',
  description: 'Create, edit, delete dynamic commands.',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  aliases: ['command'],
  execute(message, args) {
    if (args.length === 0) {
      Command.find().then((docs) => {
        if (docs.length) {
          const commands = docs.map((doc) => `!${doc.name}`).join('\n');
          return message.channel.info(`List of dynamic commands:\n${commands}`);
        }

        return message.channel.info('There are no dynamic commands.');
      });

      return;
    }

    const action = args[0];
    const filter = (m) => m.author.id === message.author.id;
    const options = { max: 1, time: 60000, errors: ['time'] };

    const ADD = 'add';
    const EDIT = 'edit';
    const DELETE = 'delete';
    const actions = [ADD, EDIT, DELETE];
    if (!actions.includes(action)) {
      // eslint-disable-next-line consistent-return
      return message.channel.warn(`Wrong action. Allowed actions: ${actions.join(', ')}`);
    }

    const { client } = message;
    const commandName = args[1];
    switch (action) {
      case ADD:
        if (args.length < 2) {
          // eslint-disable-next-line consistent-return
          return message.channel.warn('Wrong amount of arguments. Example: `!commands add name`');
        }

        // eslint-disable-next-line no-case-declarations
        const staticCommand = client.commands.get(commandName)
          || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
        if (staticCommand) {
          // eslint-disable-next-line consistent-return
          return message.channel.warn('There is already a static command with that name!');
        }

        message.channel.info(`Send a response message for this command. Waiting 1 minute.
Type \`cancel\` to cancel.`).then(() => {
          message.channel.awaitMessages(filter, options).then((collected) => {
            const { content } = collected.first();

            if (content.toLowerCase() === 'cancel') {
              throw new Error('cancel');
            }

            // eslint-disable-next-line consistent-return
            Command.findOne({ name: commandName }).then((command) => {
              if (command) {
                return message.channel.warn('There is already a dynamic command with that name!');
              }
              const newCommand = new Command();
              newCommand.name = commandName;
              newCommand.message = content;
              newCommand.save().then(() => {
                message.channel.success('Command added.');
              });
            });
          }).catch(() => message.channel.error('Command cancelled.'));
        });

        break;
      case EDIT:
        if (args.length < 2) {
          // eslint-disable-next-line consistent-return
          return message.channel.warn('Wrong amount of arguments. Example: `!commands edit name`');
        }

        Command.findOne({ name: commandName }).then((command) => {
          if (command) {
            message.channel.info(`Send a new response message for this command. Waiting 1 minute.
Type \`cancel\` to cancel.`).then(() => {
              message.channel.awaitMessages(filter, options).then((collected) => {
                const { content } = collected.first();

                if (content.toLowerCase() === 'cancel') {
                  throw new Error('cancel');
                }

                // eslint-disable-next-line no-param-reassign
                command.message = content;
                command.save().then(() => {
                  message.channel.success('Command edited.');
                });
              }).catch(() => message.channel.error('Command cancelled.'));
            });
          } else {
            message.channel.warn('There is no dynamic command with that name.');
          }
        });

        break;

      case DELETE:
        if (args.length < 2) {
          // eslint-disable-next-line consistent-return
          return message.channel.warn('Wrong amount of arguments. Example: `!commands delete name`');
        }

        Command.findOne({ name: commandName }).then((command) => {
          if (command) {
            message.channel.info('Are you sure you want to delete this command? `(yes / no)`. Waiting 1 minute.').then(() => {
              message.channel.awaitMessages(filter, options).then((collected) => {
                const { content } = collected.first();

                if (content.toLowerCase() === 'yes') {
                  command.delete().then(() => {
                    message.channel.success('Command deleted.');
                  });
                } else {
                  throw Error('cancel');
                }
              }).catch(() => message.channel.error('Command cancelled.'));
            });
          } else {
            message.channel.warn('There is no dynamic command with that name.');
          }
        });

        break;
      default:
        break;
    }
  },
};
