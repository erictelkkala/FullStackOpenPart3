require("dotenv").config();
const mongoose = require("mongoose");

// Get the password from the environment variable
// const password = process.env.MONGO_PASSWORD;
// URL to the database
const url = process.env.MONGO_URI;

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB: ", error.message);
  });

// SCHEMA
const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: [true, "Name is required"],
  },
  number: {
    type: String,
    required: [true, "Phone number is required"],
  },
});

// Number validator
const numberValidator = (v) => {
  return /[0-9]{1,3}-[0-9]{6,10}/.test(v);
};

// Apply the validator to the phone number field
phonebookSchema
  .path("number")
  .validate(numberValidator, "`{VALUE}` is an invalid phone number");

// Remove the id and version fields from the schema
phonebookSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("PhonebookEntries", phonebookSchema);
