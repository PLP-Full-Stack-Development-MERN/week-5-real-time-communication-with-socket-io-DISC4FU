"use client"

import type { Note } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NotesListProps {
  notes: Note[]
  onSelectNote: (note: Note) => void
  selectedNoteId?: string
}

export default function NotesList({ notes, onSelectNote, selectedNoteId }: NotesListProps) {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className={`p-2 rounded cursor-pointer hover:bg-accent ${selectedNoteId === note._id ? "bg-accent" : ""}`}
              onClick={() => onSelectNote(note)}
            >
              <h3 className="font-medium truncate">{note.title}</h3>
              <p className="text-xs text-muted-foreground truncate">Last edited by: {note.lastEditedBy}</p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

