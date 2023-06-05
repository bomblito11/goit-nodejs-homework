const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");
const { error } = require("console");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const contacts = await fs.readFile(contactsPath);
  return JSON.parse(contacts);
};

const getContactById = async (contactId) => {
  const parsedContacts = await listContacts();
  return parsedContacts.find((contact) => contact.id === contactId);
};

const removeContact = async (contactId) => {
  const parsedContacts = await listContacts();
  const foundContact = parsedContacts.findIndex(
    (contact) => contact.id === contactId
  );
  if (foundContact === -1) {
    return `There is no contact with id of ${contactId}`;
  } else {
    const newContactsList = parsedContacts.filter(
      (contact) => contact.id !== contactId
    );
    fs.writeFile(contactsPath, JSON.stringify(newContactsList));
  }
};

const addContact = async (body) => {
  const { name, email, phone } = body;
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  const parsedContacts = await listContacts();
  const newContactsList = [...parsedContacts, newContact];
  fs.writeFile(contactsPath, JSON.stringify(newContactsList));
};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
