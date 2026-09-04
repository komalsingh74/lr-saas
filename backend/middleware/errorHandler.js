// middleware/errorHandler.js
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return { statusCode: 400, status: "fail", message };
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors || {}).map((error) => error.message);
  const message = errors.length ? errors.join(". ") : "Validation failed.";
  return { statusCode: 400, status: "fail", message };
};

const handleDuplicateFieldsError = (err) => {
  const keys = Object.keys(err.keyValue || {});
  const fields = keys.join(", ");
  const message = keys.length
    ? `${fields.charAt(0).toUpperCase() + fields.slice(1)} already exists. Please use another value.`
    : "Duplicate field value entered. Please use another value.";
  return { statusCode: 400, status: "fail", message };
};

const handleJwtError = () => ({
  statusCode: 401,
  status: "fail",
  message: "Invalid token. Please log in again.",
});

const handleJwtExpiredError = () => ({
  statusCode: 401,
  status: "fail",
  message: "Your session has expired. Please log in again.",
});

const errorHandler = (err, req, res, next) => {
  console.error(err); // log for dev

  let customError = {
    statusCode: err.statusCode || 500,
    status: err.status || "error",
    message: err.message || "Something went wrong.",
  };

  if (err.name === "CastError") {
    customError = handleCastError(err);
  } else if (err.name === "ValidationError") {
    customError = handleValidationError(err);
  } else if (err.code === 11000) {
    customError = handleDuplicateFieldsError(err);
  } else if (err.name === "JsonWebTokenError") {
    customError = handleJwtError();
  } else if (err.name === "TokenExpiredError") {
    customError = handleJwtExpiredError();
  }

  res.status(customError.statusCode).json({
    status: customError.status,
    message: customError.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;