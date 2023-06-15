const service = require("../service/index");
const Joi = require("joi");

const addContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  email: Joi.string().email().lowercase().required(),

  phone: Joi.string().min(5).max(13).required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),

  email: Joi.string().email().lowercase(),

  phone: Joi.string().min(5).max(13),
});

const updateStatusSchema = Joi.object({
  favorite: Joi.bool().required(),
});

const get = async (req, res, next) => {
  try {
    const results = await service.getAllcontacts();
    res.status(200).json(results);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getById = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await service.getContactById(contactId);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: `Not found contact id: ${contactId}`,
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const create = async (req, res, next) => {
  const { name, email, phone } = req.body;
  try {
    Joi.attempt(req.body, addContactSchema);
    const result = await service.createContact({ name, email, phone });
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const update = async (req, res, next) => {
  const { contactId } = req.params;
  const { name, email, phone } = req.body;
  try {
    Joi.attempt(req.body, updateContactSchema);
    const result = await service.updateContact(contactId, {
      name,
      email,
      phone,
    });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({
        message: `Not found contact id: ${contactId}`,
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const remove = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const result = await service.removeContact(contactId);
    if (result) {
      res.status(200).json({ message: `Removed contact id: ${contactId}` });
    } else {
      res.status(404).json({
        message: `Not found contact id: ${contactId}`,
      });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const updateStatus = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite = false } = req.body;

  try {
    const { error } = Joi.attempt(req.body, updateStatusSchema);
    if (error) {
      res.status(400).json({ message: "missing field favorite" });
    } else {
      const result = await service.updateStatusContact(contactId, { favorite });
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: `Not found contact id: ${contactId}`,
        });
      }
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  get,
  getById,
  create,
  update,
  remove,
  updateStatus,
};
