const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url);

mongoose.connect(url, {
    useNewUrlParser: true, useUnifiedTopology: true,
    useFindAndModify: false, useCreateIndex: true
})
    .then(result => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message);
    })

const noteSchema = new mongoose.Schema({
    // use validation functionality in Mongoose
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    important: Boolean

    /*content: String,
    date: Date,
    important: Boolean,*/
})

/* this section is to format what is returned my mongodb by modifying the 'toJSON'
method of the schema */
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)