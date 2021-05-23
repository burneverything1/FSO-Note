require('dotenv').config()
const express = require('express')
const app = express()
const Note = require('./models/note')

//add json-parser for incoming POST requests
app.use(express.json())

//add cors to allow for requests from all origins
const cors = require('cors')
app.use(cors())

//add morgan middleware for logging
const morgan = require('morgan')
app.use(morgan('tiny'))

//add static to display 'build' folder with react frontend
app.use(express.static('build'))

let notes = [
    {
        id: 1,
        content: 'HTML is easy',
        date: "2019-05-30T17:30:31.098Z",
        important: true
      },
      {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2019-05-30T18:39:34.091Z",
        important: false
      },
      {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2019-05-30T19:20:14.298Z",
        important: true
      }
]

/* MONGODB SECTION

const mongoose = require('mongoose')

const url = 
`mongodb+srv://timmyylee95:${process.env.mongoDB_pass}@cluster0.o1axb.mongodb.net/note-app?retryWrites=true&w=majority`

mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false, 
    useCreateIndex: true
})

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

this section is to format what is returned my mongodb by modifying the 'toJSON'
method of the schema
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})*/

// ROUTE HANDLERS

app.get('/api/notes', (request,response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

//REST interface for single notes
app.get('/api/notes/:id', (request, response) => {
    Note
        .findById(request.params.id)        // the :id in URL
        .then(note => {
            response.json(note)
        })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    // recreate notes object without given note

    response.status(204).end()
})

//update request for toggle importance of
app.put('/api/notes/:id', (request, response) => {
    const body = request.body

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = notes.find(note => note.id === body.id)
    note.important = body.important
    
    response.json(note)
})

const generateId = () => {
    //find the largest ID in current list
    const maxId = notes.length > 0  //ternary operator
        ? Math.max(...notes.map(n => n.id))
        : 0
        /*
        create a new array with the ids of notes, then find max
        use three dot spread syntax to transform into individual numbers
        */
    return maxId + 1
}

app.post('/api/notes', (request, response) => {
    const body = request.body
    /*
    the json-parser takes the JSON data of a request, transforms it
    into a JS object and attaches it to the .body property of the request
    object before the route handler is called
    */
    
    //check for content in request
    if (body.content === undefined) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,     //if data in body has .important, evaluate. Else, default to false
        date: new Date(),
    })

    note
        .save()
        // use a callback for .save() so that the response is only sent if operation succeeded
        .then(savedNote => {                // the data sent back is formatted with the 'toJSON' method
            response.json(savedNote)
        })
})

/*
Middleware are functions for handling request and response objects
Below is a middleware function to catch if no route handles the HTTP request
*/

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint '})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT       //get port from heroku or use 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})