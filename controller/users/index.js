const User = require("../../service/schemas/users");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const validationSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(6).required(),
});

const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const { error } = Joi.attempt(req.body, validationSchema);
    if (error) {
      res.status(400).json({
        status: "Bad request",
        code: 400,
        message: error.message,
        data: "Bad request",
      });
    } else {
      const user = await User.findOne({ email }).lean();
      if (user) {
        return res.status(409).json({
          status: "error",
          code: 409,
          message: "Email is already in use",
          data: "Conflict",
        });
      }
      try {
        const newUser = new User({ username, email });
        newUser.setPassword(password);
        await newUser.save();
        res.status(201).json({
          status: "success",
          code: 201,
          data: {
            user: {
              email: newUser.email,
              subscription: newUser.subscription,
            },
          },
        });
      } catch (error) {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const { error } = Joi.attempt(req.body, validationSchema);
    if (error) {
      res.status(400).json({
        status: "Bad request",
        code: 400,
        message: error.message,
        data: "Bad request",
      });
    } else {
      const user = await User.findOne({ email });

      if (!user || !user.validPassword(password)) {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "Incorrect email or password",
          data: "Bad request",
        });
      }

      const payload = {
        id: user.id,
        username: user.username,
      };

      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      user.setToken(token);
      await user.save();

      res.json({
        status: "success",
        code: 200,
        data: {
          token: user.token,
          user: {
            email: user.email,
            subscription: user.subscription,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { _id } = req.user;
  try {
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        code: 401,
        message: "Not authorized",
        data: "Bad request",
      });
    }

    user.setToken(null);
    await user.save();

    return res.status(204).send("No content");
  } catch (error) {
    next(error);
  }
};

const current = async (req, res, next) => {
  const { _id } = req.user;

  try {
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        code: 401,
        message: "Not authorized",
        data: "Bad request",
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  current,
};
