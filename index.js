const express = require('express')
const app = express()

let persons = [
    { 
        "id": 1,
        "name": "Arto Hellas", 
        "number": "040-123456"
      },
      { 
        "id": 2,
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
      },
      { 
        "id": 3,
        "name": "Dan Abramov", 
        "number": "12-43-234345"
      },
      { 
        "id": 4,
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

// Main page
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// Get the list of persons in JSON format
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// Get the person with the given id in JSON format
app.get('/api/persons/:id', (request, response) => {
  // Set the id variable to the request parameter
  const id = Number(request.params.id)
  // Find the person with the given id
  const person = persons.find(person => person.id === id)
  // If the person is found, return the person in JSON format
  if (person) {
    response.json(person)
    // If the person is not found, return 404
  } else {
    response.status(404).end()
  }
})

// Get the lenght of the list of persons and the current date
app.get('/info', (request, response) => {
  // Get the current date
  const date = new Date()
  // Get the length of the list of persons
  // Also displey the date variable under the lenght
  const info = `<p>Phonebook has info for ${persons.length} people</p>
  <p>${date}</p>`
  response.send(info)
})

// Delete a person with the given id from the list
app.delete('/api/persons/:id', (request, response) => {
  // Set the id variable to the request parameter
  const id = Number(request.params.id)
  // Find the person with the given id
  const person = persons.find(person => person.id === id)
  // If the person is found, remove the person from the list
  if (person) {
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
    // If the person is not found, return 404
  } else {
    response.status(404).end()
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})