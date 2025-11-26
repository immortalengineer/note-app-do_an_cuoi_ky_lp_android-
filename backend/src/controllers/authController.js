import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

// Hàm kiểm tra input
const validateFields = (fields) => {
  for (const key in fields) {
    if (!fields[key]) return key;
  }
  return null;
};

// 🟢 Đăng ký user
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const missingField = validateFields({ username, email, password });
  if (missingField) {
    return res.status(400).json({ message: `Thiếu trường: ${missingField}` });
  }

  try {
    const exist = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exist.rows.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: "Đăng ký thành công",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 🟡 Đăng nhập user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const missingField = validateFields({ email, password });
  if (missingField) {
    return res.status(400).json({ message: `Thiếu trường: ${missingField}` });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 🔴 Đăng xuất
export const logoutUser = (req, res) => {
  res.json({
    message: "Đăng xuất thành công — token đã bị xoá phía client"
  });
};
