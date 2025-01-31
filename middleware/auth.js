import jwt from "jsonwebtoken"

export const authenticateAdmin = (req, res, next) => {
  const token = req.header("Authorization")|| req.headers.authorization?.split(" ")[1];
 



  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const tokenValue = token.split(" ")[1];

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error decoding token: ", error);  
    res.status(401).json({ message: "Invalid token" });
  }
};
