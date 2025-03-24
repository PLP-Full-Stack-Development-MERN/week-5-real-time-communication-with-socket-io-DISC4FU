import mongoose from "mongoose"

const noteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    lastEditedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

const Note = mongoose.model("Note", noteSchema)

export default Note

