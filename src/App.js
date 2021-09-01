import React, { useState, useEffect, useRef } from 'react'
import Note from './components/Note'
import Notification from './components/Notification'
import Footer from './components/Footer'

import noteService from './services/notes'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'

const App = () => {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {   // on page load, if user is logged in, store login where needed
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important === true)
  /* a ternary operator that changes notesToShow depending on whether showAll is T/F.
  Using notesToShow allows for conditional filtering of displayed note elements. */

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()    // toggle noteForm's visibility func
    noteService
      .create(noteObject)
      .then(returnedNote => {
        /* the newnote returned by backend server is added to the list of notes
        in the application state to trigger a browser re-render */
        setNotes(notes.concat(returnedNote))
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

  const handleLogin = async (event) => {
    event.preventDefault()
    
    try {
      const user = await loginService.login({
        username, password,
      })

      // save token to browser local storage
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )

      noteService.setToken(user.token)      // sets the user token for when they try to create notes
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <Togglable buttonLabel='login'>
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  const noteFormRef = useRef()    // reference to this component, hook ensures ref keeps through re-renders

  const noteForm = () => (
    <Togglable buttonLabel='new note' ref={noteFormRef}>
      <NoteForm createNote={addNote}/>
    </Togglable>
  )

  return (
    <div>
      <h1>Notes</h1>

      <Notification message={errorMessage} />

      {user === null ?
        loginForm() :
        // if user is logged in, their name is shown
        <div>
          <p>{user.name} logged-in</p>
          {noteForm()}
        </div>
      }

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

      <Footer/>
    </div>
  )
}

export default App