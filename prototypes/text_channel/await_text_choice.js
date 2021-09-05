const { TextChannel } = require('discord.js');

/**
 * Offers a selection that can be responded with a text
 * @param question
 * @param userID
 * @param options
 * @return Promise
 */
// eslint-disable-next-line func-names
TextChannel.prototype.awaitTextChoice = async function (question, userID, options) {
  question = `${question}\n\n${options.map((o, i) => `${i + 1} - ${o}`).join('\n')}`;
  const message = await this.info(question);

  const filterFunction = (m) => m.author.id === userID;
  const filterOptions = { max: 1, time: 60000, errors: ['time'] };

  let option;

  try {
    const collectedMessages = await this.awaitMessages(filterFunction, filterOptions);
    const collectedMessage = collectedMessages.first();
    const optionId = parseInt(collectedMessage.content, 10);

    option = options.find((o, i) => i === (optionId - 1));

    await message.delete();
    await collectedMessage.delete();
  } catch (e) {
    await message.delete();

    option = null;
    this.error('Could not receive an input. Command cancelled.');
  }

  return option;
};
