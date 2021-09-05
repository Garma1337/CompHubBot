const { SignupsChannel } = require('../db/models/signups_channel');

module.exports = {
  name: 'purge_signups',
  description: 'Delete last 500 messages in the specified channel.',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  async execute(message) {
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.channel.warn('You need to mention a channel.');
    }

    const signupsChannel = await SignupsChannel.findOne({ channel: channel.id });
    if (!signupsChannel) {
      return message.channel.warn(`The channel <#${channel.id}> is not a signups channel.`);
    }

    return message.channel.warn(`This command will delete **all** messages in ${channel} channel.
Say \`confirm\` to confirm. Waiting 10 seconds.`).then((confirmMessage) => {
      message.channel.awaitMessages((m) => m.author.id === message.author.id, { max: 1, time: 10000, errors: ['time'] })
        .then((collected) => {
          const { content } = collected.first();
          if (content.toLowerCase() === 'confirm') {
            channel.fetchMessages(500).then((messages) => {
              message.channel.info(`Found ${messages.length} messages. Deleting...`).then((deletingMessage) => {
                deletingMessage.delete();

                const deletedCallback = () => {
                  message.channel.success(`All messages in ${channel} have been deleted.`);
                };

                channel.bulkDelete(messages)
                  .then(deletedCallback)
                  .catch((error) => {
                    message.channel.info(`${error.toString()}\nDeleting one by one now instead. Might take a while.`);

                    const deletePromises = messages.map((m) => m.delete());
                    Promise.all(deletePromises).then(deletedCallback);
                  });
              });
            });
          } else {
            throw new Error('cancel');
          }
        }).catch(() => {
          confirmMessage.delete();
          message.channel.error('Command cancelled.');
        });
    });
  },
};
