import pool from '../db.js';
export const createContact = async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;

    const errors = [];
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    const cleanPhone = typeof phone === 'string' ? phone.replace(/\D/g, '').slice(0, 10) : '';

    if (!cleanName) {
      errors.push('Name is required');
    }

    if (!cleanEmail) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.push('Email is invalid');
    }

    if (!cleanMessage) {
      errors.push('Message is required');
    }

    if (cleanPhone && cleanPhone.length !== 10) {
      errors.push('Phone number must be 10 digits when provided');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const result = await pool.query(
      `INSERT INTO contacts (name, email, message, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, message, phone, created_at AS "createdAt"`,
      [cleanName, cleanEmail, cleanMessage, cleanPhone || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Contact submitted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to save contact right now',
    });
  }
};
export const getContacts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, message, phone, created_at AS "createdAt"
       FROM contacts ORDER BY created_at DESC`
    );
    const contacts = result.rows;

    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch contact submissions',
    });
  }
};