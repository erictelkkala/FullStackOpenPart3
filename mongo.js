const mongoose = require("mongoose");

// Get the password from the command line arguments
const password = process.argv[2];

// URL to the database
const url = `mongodb+srv://fullstack:${password}@cluster0.inxy750.mongodb.net/?retryWrites=true&w=majority`;

// SCHEMA
const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// MODEL
const PhonebookModel = mongoose.model("PhonebookEntry", phonebookSchema);

// If only a password is given, connect to the database and print all the entries
if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .then(() => {
      PhonebookModel.find({}).then((result) => {
        console.log("Phonebook:");
        result.forEach((entry) => {
          console.log(`${entry.name} ${entry.number}`);
        });
        console.log("Connection to MongoDB closed");
        return mongoose.connection.close();
      });
    })
    .catch((err) => {
      console.log(err);
    });
} else {
  // Else add en entry to the database
  mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to MongoDB");

      const newEntry = new PhonebookModel({
        // Get the name and number from the command line arguments
        name: process.argv[3],
        number: process.argv[4],
      });

      return newEntry.save();
    })
    .then(() => {
      console.log("Entry saved!");
      console.log("Connection to MongoDB closed");
      return mongoose.connection.close();
    })
    .catch((err) => console.log(err));
}
