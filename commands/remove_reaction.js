module.exports = {
  name: 'remove_reaction',
  description: 'Remove a reaction from a message',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  args: true,
  aliases: ['unreact', 'reaction_remove'],
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    if (args.length < 2) {
      return message.channel.warn('You need to enter a message and an emote.');
    }

    const messageId = args[0];
    const emote = args[1];

    // eslint-disable-next-line consistent-return
    message.channel.messages.fetch(messageId).then((fetchedMessage) => {
      const reaction = fetchedMessage.reactions.cache.get(emote);

      if (!reaction) {
        message.channel.warn(`The message \`${messageId}\` has no reaction with the emote ${emote}.`);
      } else {
        reaction.remove()
          .then(() => message.channel.success(`The reaction ${emote} was successfully removed from the message \`${messageId}\`.`))
          .catch(() => message.channel.error(`Unable to remove the reaction ${emote} from the message \`${messageId}\`.`));
      }
    });
  },
};
