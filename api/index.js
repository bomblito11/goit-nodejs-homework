const express = require("express");

const ctrlContact = require("../controller");

const router = express.Router();

router.get("/contacts", ctrlContact.get);

router.get("/contacts/:contactId", ctrlContact.getById);

router.post("/contacts", ctrlContact.create);

router.delete("/contacts/:contactId", ctrlContact.remove);

router.put("/contacts/:contactId", ctrlContact.update);

router.patch("/contacts/:contactId/favorite", ctrlContact.updateStatus);

module.exports = router;
