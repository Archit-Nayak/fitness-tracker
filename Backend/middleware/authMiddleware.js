const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the "Authorization" header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user ID to the request object
      req.user = decoded.id;

      next(); // Move to the next function (your route logic)
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };