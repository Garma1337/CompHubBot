module.exports = {
  name: 'ping',
  description: 'Ping!',
  cooldown: 10,
  execute(message) {
    const { client } = message;
    message.channel.send('Pong!').then((m) => {
      const data = [
        `**API**: \`${Math.round(client.ws.ping)}ms\``,
        `**Server**: \`${m.createdAt - message.createdAt}ms\``,
        `**Uptime**: \`${client.uptime}ms\``,
      ];

      m.delete();
      message.channel.success(data.join('\n'));
    });
  },
};
