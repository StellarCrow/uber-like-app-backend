const express = require('express');
const router = new express.Router();
const UserService = require('../../services/UserService');
const schemas = require('../../validation/JoiSchemas');
const validate = require('../middleware/requestValidator');


router.post(
    '/auth/register',
    validate(schemas.registration, 'body'),
    async (req, res) => {
      const newUser = {
        name: req.body.name,
        email: req.body.username,
        password: req.body.password,
        role: req.body.role.toLowerCase(),
      };

      try {
        await UserService.registrate(newUser);
        return res.status(200).json({status: 'User registered successfully'});
      } catch (err) {
        if (err.name === 'ServerError') {
          return res.status(500).json({error: err.message});
        }
        return res.status(400).json({error: err.message});
      }
    },
);


router.post(
    '/auth/login',
    validate(schemas.authorization, 'body'),
    async (req, res) => {
      const userInfo = {
        email: req.body.username,
        password: req.body.password,
      };

      try {
        const {token} = await UserService.authenticate(userInfo);
        return res.status(200).json({status: 'User authenticated successfully', token: token});
      } catch (err) {
        if (err.name === 'ServerError') {
          return res.status(500).json({error: err.message});
        }
        return res.status(400).json({error: err.message});
      }
    },
);

module.exports = router;
