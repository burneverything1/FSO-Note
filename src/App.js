import React, { useState, useEffect } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'
import noteService from './services/notes'

const App = (props) => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')        //a state for storing user-submitted input
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }
  /* the HTML input element needs an onChange handler to allow the user to
  change the element. Only setting value=newNote state causes the App component
  to take control of the element, preventing input. */

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important === true)
  /* a ternary operator that changes notesToShow depending on whether showAll is T/F.
  Using notesToShow allows for conditional filtering of displayed note elements. */

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      date: new Date().toISOString(),
      important: Math.random() < 0.5
    }

    //send created note in POST request
    noteService
      .create(noteObject)
      .then(returnedNote => {
        /* the newnote returned by backend server is added to the list of notes
        in the application state to trigger a browser re-render */
        setNotes(notes.concat(returnedNote))
        setNewNote('')
      })
  }

  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important}
    /* Create a new note that is a copy of the old note except for the important
    property. We create a new note instead of mutating the note directly as that
    would be mutating state directly */

    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))
        //replace Notes with a new array that is the same except for the changed note
      })
      .catch(error => {
        setErrorMessage(`the note '${note.content}' was already deleted from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>
      <ul>
        {notesToShow.map(note =>
          <Note key={note.id} note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
          //create a Note element for every note in notesToShow  
        )}
      </ul>
      <form onSubmit={addNote}>
        <input 
          value={newNote}
          onChange={handleNoteChange}   //called every time a change occurs in input element
        />
        <button type="submit">save</button>
      </form>
      <Footer/>
    </div>
  )
}

export default App