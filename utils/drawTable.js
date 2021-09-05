const Discord = require('discord.js');
const Canvas = require('canvas');
const { parseData, drawTableDefault } = require('../table');

module.exports = (text) => {
  const data = parseData(text);
  const canvas = Canvas.createCanvas(700, 250);

  return drawTableDefault(canvas, null, null, data).then(() => {
    try {
      const buffer = canvas.toBuffer();
      return new Discord.MessageAttachment(buffer, 'table.png');
    } catch (e) {
      return new Discord.MessageAttachment('table/assets/img/turtle.png');
    }
  });
};
