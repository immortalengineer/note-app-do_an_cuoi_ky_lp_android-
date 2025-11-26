import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  let token;

  // 1️⃣ Ưu tiên header chuẩn: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ Nếu không có, dùng header custom: token: <token>
  if (!token && req.headers["token"]) {
    token = req.headers["token"];
  }

  console.log("🔍 Token nhận được từ client:", token);

  // 3️⃣ Kiểm tra token
  if (!token || token === "null") {
    return res.status(401).json({ message: "Thiếu token hoặc token rỗng" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Lưu thông tin user vào req để dùng tiếp
    req.user = decoded;

    return next();
  } catch (err) {
    console.error("❌ JWT Verify Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Token đã hết hạn",
        expired: true
      });
    }

    return res.status(403).json({
      message: "Token không hợp lệ"
    });
  }
};
