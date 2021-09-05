const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const FinishedLobby = new Schema({
  type: String,
  trackOption: String,
  ruleset: Number,
  regions: { type: [String], default: null },
  engineRestriction: { type: String, default: null },
  survivalStyle: { type: Number, default: null },
  tournament: { type: Boolean, default: false },
  ranked: { type: Boolean, default: true },
  averageRank: { type: Number, default: 0 },
  number: { type: Number, default: 1 },
});

module.exports.FinishedLobby = model('finishedLobby', FinishedLobby);
