const User = require("../../service/schemas/users");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
require("dotenv").config();
const secret = process.env.SECRET;
const Joi = require("joi");
const Jimp = require("jimp");
const { error } = require("console");
const randomstring = require("randomstring");
const nanoid = require("nanoid");
const { sendVerificationEmail } = require("../../mailSender/mailsender");

const validationSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(6).required(),
});

const emailValidationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const signup = async (req, res, next) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "retro" });
  const verificationToken = nanoid.nanoid();

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
        const newUser = new User({ email, avatarURL, verificationToken });
        newUser.setPassword(password);
        await newUser.save();

        await sendVerificationEmail(email, verificationToken);

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

      if (user.verify === false) {
        return res.status(401).json({
          status: "Unauthorized",
          code: 401,
          message: "User not verified",
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

const updateAvatar = async (req, res, next) => {
  try {
    const { path: temporaryName } = req.file;
    const ext = path.extname(temporaryName);
    const avatarName = randomstring.generate() + ext;
    const storeAvatar = path.join(
      process.cwd(),
      "public",
      "avatars",
      avatarName
    );

    try {
      Jimp.read(temporaryName).then((avatar) => {
        return avatar.resize(250, 250).quality(60).write(storeAvatar);
      });
    } catch {
      console.error(error);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        code: 401,
        message: "Not authorized",
        data: "Bad request",
      });
    }

    user.avatarURL = `/avatars/${avatarName}`;
    await user.save();

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        avatarURL: user.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  const { verificationToken } = req.params;
  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({
        status: "Not Found",
        code: 404,
        message: "User not found",
      });
    }

    user.verificationToken = "null";
    user.verify = true;
    await user.save();

    res.status(200).json({
      status: "OK",
      code: 200,
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    const { error } = Joi.attempt({ email }, emailValidationSchema);
    if (error) {
      return res.status(400).json({
        status: "Bad request",
        code: 400,
        message: error.message,
      });
    } else {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: "Not Found",
          code: 404,
          message: "User not found",
        });
      }

      if (user.verify === true) {
        return res.status(400).json({
          status: "Bad request",
          code: 400,
          message: "Verification has already been passed",
        });
      }

      await sendVerificationEmail(user.email, user.verificationToken);

      res.status(200).json({
        status: "OK",
        code: 200,
        message: "Verification email sent",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  current,
  updateAvatar,
  verifyUser,
  resendVerificationEmail,
};
