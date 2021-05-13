const express = require('express')
const app = express()

//add json-parser for incoming POST requests
app.use(express.json())

//add cors to allow for requests from all origins
const cors = require('cors')
app.use(cors())

//add morgan middleware for logging
const morgan = require('morgan')
app.use(morgan('tiny'))

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

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request,response) => {
    response.json(notes)
})

//REST interface for single notes
app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)                //id parameter from URL
    const note = notes.find(note => note.id === id)
    
    if (note) {
        // if note exists, return note
        response.json(note)
    } else {
        // not exists, return 404
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    // recreate notes object without given note

    response.status(204).end()
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
    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important || false,     //if data in body has .important, evaluate. Else, default to false
        date: new Date(),
        id: generateId(),
    }

    notes = notes.concat(note)

    response.json(note)
})

/*
Middleware are functions for handling request and response objects
Below is a middleware function to catch if no route handles the HTTP request
*/

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint '})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001       //get port from heroku or use 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})