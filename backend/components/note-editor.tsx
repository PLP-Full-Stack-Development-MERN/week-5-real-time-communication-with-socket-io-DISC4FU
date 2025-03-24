"use client"

import { useState, useEffect } from "react"
import type { Note } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NoteEditorProps {
  note: Note
  onUpdateNote: (noteId: string, content: string) => void
  onDeleteNote: (noteId: string) => void
  username: string
}

export default function NoteEditor({ note, onUpdateNote, onDeleteNote, username }: NoteEditorProps) {
  const [content, setContent] = useState(note.content)
  const [isEditing, setIsEditing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Update content when note changes
  useEffect(() => {
    setContent(note.content)
    setIsEditing(false)
  }, [note])

  // Auto-save functionality (every 3 seconds while editing)
  useEffect(() => {
    if (!isEditing) return

    const saveInterval = setInterval(() => {
      if (content !== note.content) {
        onUpdateNote(note._id, content)
        setLastSaved(new Date())
      }
    }, 3000)

    return () => clearInterval(saveInterval)
  }, [isEditing, content, note, onUpdateNote])

  const handleSave = () => {
    onUpdateNote(note._id, content)
    setLastSaved(new Date())
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{note.title}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Created by: {note.createdBy}</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the note.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteNote(note._id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setIsEditing(true)
          }}
          className="min-h-[300px] resize-none"
          placeholder="Start typing your note..."
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {lastSaved ? (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Last edited by: {note.lastEditedBy}</span>
          )}
        </div>
        {isEditing && <Button onClick={handleSave}>Save Changes</Button>}
      </CardFooter>
    </Card>
  )
}

