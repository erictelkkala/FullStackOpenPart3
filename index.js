const express = require("express");
const app = express();
const Phonebook = require("./models/mongo");

// CORS

const cors = require("cors");

// Morgan
const morgan = require("morgan");

// Morgan token for POST requests
morgan.token("body", (req, res) => {
  return JSON.stringify(req.body);
});

// Error handling
const errorHandler = (error, request, response, next) => {
  console.error(error.message + "Middleware");

  if (error.name === "CastError") {
    response.status(400).send("malformed ID");
  }

  next(error);
};

// Static files
app.use(express.static("build"));
// JSON parser
app.use(express.json());
// CORS
app.use(cors());
// Morgan
app.use(
  morgan("tiny", {
    // Skip the tine format if the request is POST
    skip: function (req, res) {
      return req.method === "POST";
    },
  })
);
// Log the body of POST requests
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :body",
    {
      // Skip if the request is not POST
      skip: function (req, res) {
        return req.method !== "POST";
      },
    }
  )
);

// Main page
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

// Get the list of persons in JSON format
app.get("/api/persons", (request, response) => {
  Phonebook.find({}).then((persons) => {
    response.json(persons);
  });
});

// Get the person with the given id in JSON format
app.get("/api/persons/:id", (request, response, next) => {
  // Set the id variable to the request parameter
  const id = String(request.params.id);
  // Find the person with the given id
  Phonebook.findById(id)
    .exec()
    .then((person) => {
      // If the person is found, return the person in JSON format
      if (person) {
        response.json(person);
      }
    })
    // If an error occurs, pass it to the error handler
    .catch((error) => next(error));
});

// Get the length of the list of persons and the current date
app.get("/info", (request, response) => {
  // Get the current date
  const date = new Date();
  // Get the length of the list of persons
  // Also display the date variable under the length
  const info = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}</p>`;
  response.send(info);
});

// Delete a person with the given id from the list
app.delete("/api/persons/:id", (request, response, next) => {
  // Set the id variable to the request parameter
  const id = String(request.params.id);
  // Find the person with the given id
  Phonebook.findById(id)
    .exec()
    .then((person) => {
      // If the person is found, remove the person from the list
      if (person) {
        Phonebook.findByIdAndRemove(id).exec();
        response.status(204).end();
        // If the person is not found, return 404
      } else {
        response.status(404).end();
      }
    })
    // If an error occurs, pass it to the error handler
    .catch((error) => next(error));
});

// Add a new person to the list
app.post("/api/persons", (request, response) => {
  // Get the body of the request
  const body = request.body;
  // If the name and number are not given, return 400
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  // DUPLICATE CHECK

  // // If the name is already in the list, return 400
  // const duplicateName = Phonebook.find({ name: body.name });
  // if (duplicateName) {
  //   return response.status(400).json({
  //     error: "name must be unique",
  //   });
  // }
  // // If the number is already in the list, return 400
  // const duplicateNumber = Phonebook.find({ number: body.number });
  // if (duplicateNumber) {
  //   return response.status(400).json({
  //     error: "number must be unique",
  //   });
  // }

  // If the name and number are given, add the person to the list
  const person = new Phonebook({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

// Error handling
app.use(errorHandler);

let port = process.env.PORT;
if (port == null || port === "") {
  port = 3001;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
