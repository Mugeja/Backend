if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')

morgan.token('body', (req) => { return JSON.stringify(req.body) })
app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  } 

  next(error)
}

app.use(errorHandler)

app.get('/persons', (req, res) => {
  Person.find({}).then(persons => { 
    res.json(persons.map(person => person.toJSON()))
  })
  
})

app.get('/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person){
    response.json(person.toJSON())}
    else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})


app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    console.log(persons.length)
    response.send(`Puhelinluettelossa on ${persons.length} henkilön tiedot. ${new Date()}` )
  })
})

app.delete('/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
});


app.post('/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: `Name or number invalid: name ${body.name} number ${body.number}`
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  
  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
  .catch(error => next(error))
})

app.put('/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})