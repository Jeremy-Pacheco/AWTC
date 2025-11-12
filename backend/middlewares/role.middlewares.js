/**
 * Middleware for only admin
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'User not authenticated' });

  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Access denied: Admins only' });

  next();
};

/**
 * Middleware for only coordinator
 */
exports.isCoordinator = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'User not authenticated' });

  if (req.user.role !== 'coordinator')
    return res.status(403).json({ message: 'Access denied: Coordinators only' });

  next();
};

/**
 * Middleware for admin or coordinator
 */
exports.isAdminOrCoordinator = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: 'User not authenticated' });

  if (!['admin', 'coordinator'].includes(req.user.role))
    return res.status(403).json({ message: 'Access denied: Admin or Coordinator required' });

  next();
};
