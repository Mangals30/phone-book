require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL).then(result => {
  console.log('Connected to database successfully')
}).catch(error => {
  console.log('Could not connect to database')
})
const PersonSchema = new mongoose.Schema({
  name: String,
  number: String
})
PersonSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Person = mongoose.model('Person', PersonSchema)
module.exports = Person
