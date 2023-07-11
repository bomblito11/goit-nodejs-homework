const express = require("express");
const auth = require("../middleware/auth");

const { upload } = require("../middleware/avatars");
const ctrlContact = require("../controller/contacts");
const ctrlUser = require("../controller/users");

const router = express.Router();

router.get("/contacts", auth, ctrlContact.get);

router.get("/contacts/:contactId", auth, ctrlContact.getById);

router.post("/contacts", auth, ctrlContact.create);

router.delete("/contacts/:contactId", auth, ctrlContact.remove);

router.put("/contacts/:contactId", auth, ctrlContact.update);

router.patch("/contacts/:contactId/favorite", auth, ctrlContact.updateStatus);

router.post("/users/signup", ctrlUser.signup);

router.post("/users/login", ctrlUser.login);

router.get("/users/logout", auth, ctrlUser.logout);

router.get("/users/current", auth, ctrlUser.current);

router.patch(
  "/users/avatars",
  auth,
  upload.single("avatar"),
  ctrlUser.updateAvatar
);

router.get("/users/verify/:verificationToken", ctrlUser.verifyUser);

module.exports = router;
