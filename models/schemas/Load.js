const mongoose = require('mongoose');
const {loadStateEnum, loadStatusEnum} = require('../../utils/loadConstants');

const Schema = mongoose.Schema;

const LoadSchema = new Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
    default: '',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipper',
    required: true,
  },
  assigned_to: {type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
  status: {
    type: String,
    required: true,
    default: 'NEW',
    enum: loadStatusEnum,
  },
  state: {
    type: String,
    enum: loadStateEnum,
  },
  logs: [
    {
      message: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        default: Date.now,
        required: true,
      },
    },
  ],
  dimensions: {
    width: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
  },
  payload: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    city: {type: String},
    street: {type: String},
    zip: {type: String},
  },
  pickUpAddress: {
    city: {type: String},
    street: {type: String},
    zip: {type: String},
  },
});

module.exports = mongoose.model('Load', LoadSchema);
