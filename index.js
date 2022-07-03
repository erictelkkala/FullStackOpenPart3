const express = require('express')
const app = express()
const Phonebook = require('./models/mongo')

// CORS
const cors = require('cors')

// Morgan
const morgan = require('morgan')

// Morgan token for POST requests
morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})

// Static files
app.use(express.static('build'))
// JSON parser
app.use(express.json())
// CORS
app.use(cors())

const logger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(logger)

// Morgan
app.use(
    morgan('tiny', {
        // Skip the tine format if the request is POST
        skip: function (req) {
            return req.method === 'POST'
        },
    })
)
// Log the body of POST requests
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :body',
        {
            // Skip if the request is not POST
            skip: function (req) {
                return req.method !== 'POST'
            },
        }
    )
)

// Main page
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

// Get the list of persons in JSON format
app.get('/api/persons', (request, response) => {
    Phonebook.find({})
        .then((persons) => {
            response.json(persons)
        })
        .catch((error) => {
            response.status(400).send(error)
        })
})

// Get the person with the given id in JSON format
app.get('/api/persons/:id', (request, response, next) => {
    // Set the id variable to the request parameter
    const id = String(request.params.id)
    // Find the person with the given id
    Phonebook.findById(id)
        .exec()
        .then((person) => {
            // If the person is found, return the person in JSON format
            if (person) {
                response.json(person)
            }
        })
        // If an error occurs, pass it to the error handler
        .catch((error) => next(error))
})

// Get the length of the list of persons and the current date
app.get('/info', (request, response, next) => {
    // Get the current date
    const date = new Date()

    // Find the number of persons in the database
    Phonebook.countDocuments({}, function (err, count) {
        if (err) {
            next(err)
        }
        try {
            // Send the number of persons and the current date in JSON format as the response
            response.send(`<p>Phonebook has info for ${count} people</p>
    <p>${date}</p>`)
        } catch (error) {
            next(error)
        }
    })
})

// Delete a person with the given id from the list
app.delete('/api/persons/:id', (request, response, next) => {
    // Set the id variable to the request parameter
    const id = String(request.params.id)
    // Find the person with the given id
    Phonebook.findById(id)
        .exec()
        .then((person) => {
            // If the person is found, remove the person from the list
            if (person) {
                Phonebook.findByIdAndRemove(id).exec()
                response.status(204).end()
                // If the person is not found, return 404
            } else {
                response.status(404).end()
            }
        })
        // If an error occurs, pass it to the error handler
        .catch((error) => next(error))
})

// Add a new person to the list
app.post('/api/persons', (request, response) => {
    // Get the body of the request
    const body = request.body
    // If the name and number are not given, return 400
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        })
    }

    // If the name and number are given, add the person to the list
    const person = new Phonebook({
        name: body.name,
        number: body.number,
    })

    person
        .save()
        .then((savedPerson) => {
            response.json(savedPerson)
        })
        .catch((error) => {
            response.status(400).send(error)
        })
})

// Modify a person with the given id
app.put('/api/persons/:id', (request, response, next) => {
    // Set the id variable to the request parameter
    const id = String(request.params.id)
    // Get the body of the request
    const body = request.body
    // If the name and number are not given, return 400
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing',
        })
    }

    // Options for validation update function
    const opts = { runValidators: true, context: 'query' }

    // If the name and number are given, modify the person with the given id
    Phonebook.findByIdAndUpdate(
        id,
        {
            name: body.name,
            number: body.number,
        },
        opts
    )
        .then(
            (person) => {
                // If the person is found, return the person in JSON format
                if (person) {
                    response.json(person.toJSON())
                }
            }
            // If an error occurs, pass it to the error handler
        )
        .catch((error) => next(error))
})

// Unknown route
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Error handling
const errorHandler = (error, request, response, next) => {
    console.error('Mongoose error: ' + error.message)

    if (error.name === 'CastError') {
        return response.status(400).send('malformed ID')
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

// Configure the port to look for the environment variable PORT, otherwise use port 3001
let port = process.env.PORT
if (port == null || port === '') {
    port = 3001
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
