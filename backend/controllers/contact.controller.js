const db = require('../models');

const Contact = db.Contact;

exports.create = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });

    const contact = await Contact.create({ name, email, subject, message });
    return res.status(201).json(contact);
  } catch (err) {
    console.error('Create contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.findAll = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(contacts);
  } catch (err) {
    console.error('Find contacts error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.findOne = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Not found' });
    return res.json(contact);
  } catch (err) {
    console.error('Find contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Not found' });
    await contact.update(req.body);
    return res.json(contact);
  } catch (err) {
    console.error('Update contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Not found' });
    await contact.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete contact error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
