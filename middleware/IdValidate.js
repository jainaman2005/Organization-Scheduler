const mongoose = require("mongoose");

const IdValidate = (req, res, next) => {
  const allKeys = Object.keys(req.params); // get all param keys
  const idKeys = allKeys.filter(key => key.endsWith("Id"));
  for (const key of idKeys) {
    const id = req.params[key];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${key} Id.` });
    }
  }
  next();
};
module.exports = IdValidate ;