const notFound = (req, res) => {
  const status = 404;
  const message = "route not found";
  res.status(status).json({ error: message });
};

const notFoundHandler = {
  notFound: notFound
};

module.exports = notFoundHandler;
