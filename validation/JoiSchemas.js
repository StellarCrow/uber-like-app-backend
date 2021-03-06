const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const {loadStateEnum, loadStatusEnum}= require('../utils/loadConstants');
const {truckTypesEnum}= require('../utils/truckConstants');

const schemas = {
  registration: Joi.object({
    name: Joi.string(),
    username: Joi.string()
        .email()
        .required(),
    password: Joi.string().required(),
    role: Joi.string()
        .valid('driver', 'shipper').lowercase()
        .required(),
  }),
  authorization: Joi.object({
    username: Joi.string()
        .email()
        .required(),
    password: Joi.string().required(),
  }),
  passwordUpdate: Joi.object({
    password: Joi.string().required(),
  }),
  routeId: Joi.object({
    id: Joi.objectId().required(),
    query: Joi.string(),
  }),
  routeIds: Joi.object({
    id: Joi.objectId().required(),
    sid: Joi.objectId().required(),
    query: Joi.string(),
  }),
  createTruck: Joi.object({
    name: Joi.string(),
    type: Joi.any().valid(...truckTypesEnum).required(),
  }),
  truckUpdate: Joi.object({
    name: Joi.string().required(),
  }),
  createLoad: Joi.object({
    dimensions: Joi.object({
      width: Joi.number().required(),
      length: Joi.number().required(),
      height: Joi.number().required(),
    }).required(),
    payload: Joi.number().required(),
  }),
  updateLoad: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    dimensions: Joi.object({
      width: Joi.number().required(),
      length: Joi.number().required(),
      height: Joi.number().required(),
    }),
    payload: Joi.number(),
    deliveryAddress: Joi.object({
      city: Joi.string().required(),
      street: Joi.string().required(),
      zip: Joi.string().length(5).required(),
    }),
    pickUpAddress: Joi.object({
      city: Joi.string().required(),
      street: Joi.string().required(),
      zip: Joi.string().length(5).required(),
    }),
  }),
  changeLoadStatus: Joi.object({
    state: Joi.any().valid(...loadStateEnum).required(),
  }),
  loadsQuery: Joi.object({
    filter: Joi.any().valid(...loadStatusEnum, ''),
    page: Joi.number().allow('').optional(),
  }),
};

module.exports = schemas;
