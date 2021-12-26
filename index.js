require('dotenv').config()
const express = require('express')
const { token } = require('morgan')
const morgan = require('morgan')
const cors = require('cors')
const PORT = process.env.PORT || 3001
const Person = require('./models/persons')
const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const errorHandler = (error,req,res,next) => {
  console.log(error.message)
  if (error.name == 'CastError') {
    return res.status(400).send({error : 'Not a valid id'})
  }
  next(error)
}


morgan.token('body', req => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
  Person.find().then(persons => {
    res.json(persons)
  }).catch(error => res.status(400).send('<h2>Error finding the persons</h2>'))
})

app.get('/api/info', (req, res) => {
  Person.find().count().then(result => {
  res.send(`<div><p>Phone book has currently ${result} people</p><p>${ new Date()}</p></div>`)
  }).catch(error => res.status(400).send('<h2>Error getting the Info</h2>'))
})

app.get('/api/persons/:id', (req, res,next) => {
  const id = req.params.id
  Person.findById(id).then(person => {
    if (!person) {
    return res.status(404).end()
    }
      res.json(person)
  }).catch(error => {
    console.log('Error in getting the id')
    next()
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  Person.findByIdAndDelete(id).then(person => {
    if (!person) {
    return res.status(404).end()
    }
    res.status(204).end()
  }).catch(error => {
    console.log('Error in deleting the id')
    next()
  })

})

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (!body.name) {
    return res.json({error : "Name Missing"})
  }
  if (!body.number) {
    return res.json({error : "Number Missing"})
  }
  const newPerson = new Person({
    name : req.body.name,
    number : req.body.number
  })
  newPerson.save().then(savedPerson => {
    res.json(savedPerson)
  }).catch(error => res.status(500).end())

})
app.put('/api/persons/:id', (req, res) => {
  let id = req.params.id
  Person.findByIdAndUpdate(id).then(person => {
    if (!person) {
    return res.status(404).send('<h2>Person Not found</h2>')
    }
      if (!req.body.name) {
    return res.json({error : "Name Missing"})
  }
  if (!req.body.number) {
    return res.json({error : "Number Missing"})
    }
    person.name = req.body.name
    person.number = req.body.number
    res.json(person)
  }).catch(error => {
    console.log('Error updating the id')
    next()
  })
})
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`)
})