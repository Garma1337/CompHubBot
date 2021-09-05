const moment = require('moment-timezone');
const { Config } = require('../db/models/config');

Config.findOne({ name: 'signups_schedule' }).then((doc) => {
  if (!doc) {
    const conf = new Config();
    conf.name = 'signups_schedule';
    conf.value = {
      open: null,
      close: null,
    };
    conf.editable = false;
    conf.save();
  }
});

module.exports = {
  name: 'signups_schedule',
  description: 'Signups schedule',
  guildOnly: true,
  permissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
  aliases: ['signup_schedule'],
  // eslint-disable-next-line consistent-return
  execute(message, args) {
    if (!args.length) {
      return Config.findOne({ name: 'signups_schedule' }).then((doc) => {
        const { value } = doc;
        const notSet = 'Not set';
        const open = value.open ? moment.tz(value.open, 'UTC').format('YYYY-MM-DD h:mm A z') : notSet;
        const close = value.close ? moment.tz(value.close, 'UTC').format('YYYY-MM-DD h:mm A z') : notSet;
        message.channel.info(`Open: ${open}
Close: ${close}`);
      });
    }

    const arg = args[0];
    if (arg === 'open' || arg === 'close') {
      const tz = args.pop();
      const dateStr = args.slice(1).join(' ');
      const date = moment.tz(dateStr, 'YYYY-MM-DD h:mm A', tz);

      Config.findOne({ name: 'signups_schedule' }).then((doc) => {
        // eslint-disable-next-line no-param-reassign
        doc.value[arg] = date.toDate();
        doc.markModified('value');
        doc.save().then(() => {
          message.channel.success(`Done ${date.format('YYYY-MM-DD h:mm A z')}`);
        });
      });
    } else {
      message.channel.warn('Wrong action.');
    }
  },
};
