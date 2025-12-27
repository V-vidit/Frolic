const selfOrAdmin = (req, res, next) => {
  const loggedInUserId = req.user.id;
  const requestedUserId = req.params.id;

  if (req.user.isAdmin || loggedInUserId === requestedUserId) {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};

module.exports = selfOrAdmin;
