const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({ message: 'Name, email and password are required' });
    }

    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(422).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const [newUser] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [result.insertId]);
    const user = newUser[0];

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: user,
      access_token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    // remove password from user object
    delete user.password;

    res.json({
      message: 'Login successful',
      user: user,
      access_token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.logout = async (req, res) => {
  // Since JWT is stateless, logout is typically handled on the client side by removing the token.
  // In a real application, you might want to blacklist the token.
  res.json({ message: 'Logged out successfully' });
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, new_password, new_password_confirmation } = req.body;

    if (!email || !new_password || !new_password_confirmation) {
      return res.status(422).json({ message: 'Email, password baru, dan konfirmasi password baru harus diisi' });
    }

    if (new_password !== new_password_confirmation) {
      return res.status(422).json({ message: 'Password baru dan konfirmasi password tidak cocok' });
    }

    if (new_password.length < 8) {
      return res.status(422).json({ message: 'Password baru minimal harus 8 karakter' });
    }

    const [users] = await pool.query('SELECT id, role FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }

    if (users[0].role === 'admin') {
      return res.status(403).json({ message: 'Akun Administrator tidak dapat diatur ulang secara publik.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    res.json({ message: 'Password berhasil diperbarui' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengatur ulang password', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password, new_password_confirmation } = req.body;

    if (!current_password || !new_password || !new_password_confirmation) {
      return res.status(422).json({ message: 'Password saat ini, password baru, dan konfirmasi password baru harus diisi' });
    }

    if (new_password !== new_password_confirmation) {
      return res.status(422).json({ message: 'Password baru dan konfirmasi password tidak cocok' });
    }

    if (new_password.length < 8) {
      return res.status(422).json({ message: 'Password baru minimal harus 8 karakter' });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(422).json({ message: 'Password saat ini salah' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengubah password', error: error.message });
  }
};
