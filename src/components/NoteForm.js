import React, {useState} from 'react'

const NoteForm = ({ createNote }) => {
    const [newNote, setNewNote] = useState('')

    const handleChange = (event) => {
        setNewNote(event.target.value)
    }
    /* the HTML input element needs an onChange handler to allow the user to
    change the element. Only setting value=newNote state causes the App component
    to take control of the element, preventing input. */

    const addNote = (event) => {
        event.preventDefault()
        createNote({
            content:newNote,
            important: Math.random() > 0.5,
        })

        setNewNote('')
    }

    return (
        <div>
            <h2>Create a new note</h2>

            <form onSubmit={addNote}>
                <input
                    value={newNote}
                    onChange={handleChange}
                />
                <button type='submit'>save</button>
            </form>
        </div>
    )
}

export default NoteForm