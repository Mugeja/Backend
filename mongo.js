const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const nimi = process.argv[3]
const numero = process.argv[4]

const url =
  `mongodb+srv://Arttu:${password}@fullstackphonebook-itfce.mongodb.net/phonebook?retryWrites=true`
mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  number: {type: String},
})

const Person = mongoose.model('Person', personSchema)

if (Person.find({nimi})) {

} 

const person = new Person({
  name: nimi,
  number: numero,
})

person.save().then(response => {
  console.log('person saved!');
  mongoose.connection.close();
})
