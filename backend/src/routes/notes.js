// src/routes/notes.js
import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: API quản lý ghi chú
 */

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Lấy tất cả ghi chú của user
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách ghi chú
 *       401:
 *         description: Thiếu token hoặc token không hợp lệ
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     summary: Lấy một ghi chú theo ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của ghi chú
 *     responses:
 *       200:
 *         description: Một ghi chú
 *       404:
 *         description: Không tìm thấy
 */
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Note không tồn tại hoặc không được phép" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Tạo ghi chú mới
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               markdown_enabled: { type: boolean }
 *               image_url: { type: string }
 *               audio_url: { type: string }
 *               drawing_data: { type: string }
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post("/", verifyToken, async (req, res) => {
  const { title, content, markdown_enabled, image_url, audio_url, drawing_data } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO notes 
       (user_id, title, content, markdown_enabled, image_url, audio_url, drawing_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        title,
        content,
        markdown_enabled ?? true,
        image_url,
        audio_url,
        drawing_data,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Cập nhật ghi chú
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               markdown_enabled: { type: boolean }
 *               image_url: { type: string }
 *               audio_url: { type: string }
 *               drawing_data: { type: string }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, markdown_enabled, image_url, audio_url, drawing_data } = req.body;

  try {
    const result = await pool.query(
      `UPDATE notes 
       SET title = $1, content = $2, markdown_enabled = $3, 
           image_url = $4, audio_url = $5, drawing_data = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, content, markdown_enabled, image_url, audio_url, drawing_data, id, req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Note không tồn tại hoặc không được phép" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Xóa ghi chú
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy
 */
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Note không tồn tại hoặc không được phép" });

    res.json({ message: "Đã xóa ghi chú" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

export default router;
