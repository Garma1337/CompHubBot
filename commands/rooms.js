const { Room } = require('../db/models/room');

module.exports = {
  name: 'rooms',
  description: 'Ranked lobby rooms',
  guildOnly: true,
  aliases: ['room'],
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    if (!args.length) {
      // eslint-disable-next-line consistent-return
      Room.find({ guild: message.guild.id }).sort({ number: 1 }).then((docs) => {
        if (!docs.length) {
          return message.channel.info('There are no rooms.');
        }

        const rooms = docs.map((doc) => {
          const channelName = `lobby-room-${doc.number}`;
          // eslint-disable-next-line max-len
          const channel = message.guild.channels.cache.find((c) => c.name.toLowerCase() === channelName.toLowerCase());
          let out = '';

          if (channel) {
            out += `${channel}`;
          } else {
            out += `#${channelName} (deleted)`;
          }

          if (doc.lobby) {
            out += ` - ${doc.lobby}`;
          } else {
            out += ' - Free';
          }

          return out;
        });

        message.channel.info(rooms.join('\n'));
      });
    } else {
      if (!message.member.isStaff()) {
        return message.channel.warn('You don\'t have permission to do that!');
      }

      const action = args.shift();

      if (action === 'free') {
        const number = args.shift();
        if (number === 'all') {
          Room.find({ guild: message.guild.id }).then((docs) => {
            const promises = docs.map((doc) => {
              doc.lobby = null;
              return doc.save();
            });

            Promise.all(promises).then(() => {
              message.channel.success('All rooms were freed.');
            });
          });
        } else {
          // eslint-disable-next-line consistent-return
          Room.findOne({ guild: message.guild.id, number }).then((doc) => {
            if (!doc) {
              return message.channel.warn('There is no room with this number.');
            }

            doc.lobby = null;
            doc.save().then(() => {
              message.channel.success('Room was freed.');
            });
          });
        }
      }
    }
  },
};
