const mongoose = require('mongoose')

/* process.argv property returns an array containing the command-line arguments passed 
when the node process was launched
*/
if (process.argv.length < 3) {
    console.log('please provide the password as an argument: node mongo.js <password>');
    process.exit(1)
}

// 'node mongo.js password' is the run command
const password = process.argv[2]

const url = `mongodb+srv://timmyylee95:${password}@cluster0.o1axb.mongodb.net/note-app?retryWrites=true&w=majority`

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
/*
Note is a model, a constructor function that create new JS objects based on
the provided parameters. objects made with the constructor functions have all the
properties of the model
*/

const Note = mongoose.model('Note', noteSchema)

/*
const note = new Note({
    content: 'test4',
    date: new Date(),
    important: true,
})

note
    .save()
    .then(result => {
        console.log('note saved!');
        mongoose.connection.close()     // needs to close connection to finish execution
    })
*/

// print all notes stored in database
Note
    .find({})       //parameter of find is an object expressing search conditions. empty object gets all notes
    .then(result => {
        result.forEach(note => {
            console.log(note);
        })
        mongoose.connection.close()
})
