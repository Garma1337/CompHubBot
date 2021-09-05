const moment = require('moment');
const { Player } = require('../db/models/player');
const { months } = require('../db/months');

module.exports = {
  name: 'set_birthday',
  description: 'Set your birthday.',
  guildOnly: true,
  cooldown: 10,
  execute(message, args) {
    if (args.length > 0 && args[0] === 'unset') {
      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.birthday = null;
        player.save().then(() => {
          message.channel.success('Your birthday has been unset.');
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      return;
    }

    if (args.length > 0) {
      let birthdate = moment(args[0].trim());

      if (!birthdate.isValid()) {
        // eslint-disable-next-line consistent-return
        return message.channel.warn(`The date "${args[0]}" is invalid.`);
      }

      birthdate = birthdate.format('YYYY-MM-DD');

      Player.findOne({ discordId: message.author.id }).then((player) => {
        if (!player) {
          player = new Player();
          player.discordId = message.author.id;
        }

        player.birthday = args[0];
        player.save().then(() => {
          message.channel.success(`Your birthday has been set to ${args[0]}.`);
        }).catch((error) => {
          message.channel.error(`Unable to update player. Error: ${error}`);
        });
      });

      return;
    }

    // eslint-disable-next-line consistent-return
    message.channel.awaitTextInput('Please enter the year. The value must be between 1970 and 2010.', message.author.id, 0).then((collectedYear) => {
      const selectedYear = parseInt(collectedYear.content, 10);
      if (selectedYear < 1970 || selectedYear > 2010) {
        return message.channel.warn('The year must be between 1970 and 2010.');
      }

      message.channel.awaitMenuChoice('Please select the month.', message.author.id, months).then((selectedMonth) => {
        // eslint-disable-next-line consistent-return
        message.channel.awaitTextInput('Please enter the day. The value must be between 1 and 31.', message.author.id, 0).then((collectedDay) => {
          let selectedDay = parseInt(collectedDay.content, 10);
          if (selectedDay < 1 || selectedDay > 31) {
            return message.channel.warn('The day must be between 1 and 31.');
          }

          if (selectedDay < 10) {
            selectedDay = `0${selectedDay}`;
          }

          const birthday = `${selectedYear}-${selectedMonth}-${selectedDay}`;
          const birthDate = moment(birthday);

          if (!birthDate.isValid()) {
            message.channel.warn(`The date "${birthday}" is invalid.`);
          } else {
            Player.findOne({ discordId: message.author.id }).then((player) => {
              if (!player) {
                player = new Player();
                player.discordId = message.author.id;
              }

              player.birthday = birthday;
              player.save().then(() => {
                message.channel.success(`Your birthday has been set to ${birthday}.`);
              }).catch((error) => {
                message.channel.error(`Unable to update player. Error: ${error}`);
              });
            });
          }
        });
      });
    });
  },
};
