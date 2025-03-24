import express from "express"
import Note from "../models/noteModel.js"

const router = express.Router()

// Get all notes for a specific room
router.get("/room/:roomId", async (req, res) => {
  try {
    const notes = await Note.find({ roomId: req.params.roomId })
    res.json(notes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new note
router.post("/", async (req, res) => {
  try {
    const { title, content, roomId, createdBy } = req.body

    const note = new Note({
      title,
      content,
      roomId,
      createdBy,
      lastEditedBy: createdBy,
    })

    const createdNote = await note.save()
    res.status(201).json(createdNote)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update a note
router.put("/:id", async (req, res) => {
  try {
    const { content, lastEditedBy } = req.body

    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    note.content = content
    note.lastEditedBy = lastEditedBy

    const updatedNote = await note.save()
    res.json(updatedNote)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ message: "Note not found" })
    }

    await note.deleteOne()
    res.json({ message: "Note removed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

