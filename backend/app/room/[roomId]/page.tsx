"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import NotesList from "@/components/notes-list"
import NoteEditor from "@/components/note-editor"
import UsersList from "@/components/users-list"
import CreateNoteForm from "@/components/create-note-form"
import type { Note, User } from "@/types"

// API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RoomPage() {
  const { roomId } = useParams()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState<string>("")
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const { toast } = useToast()

  // Initialize socket connection and fetch notes
  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username")
    if (!storedUsername) {
      window.location.href = "/"
      return
    }
    setUsername(storedUsername)

    // Connect to socket server
    const newSocket = io(API_URL)
    setSocket(newSocket)

    // Fetch notes for this room
    fetchNotes()

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [roomId])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !username) return

    // Join the room
    socket.emit("join-room", { roomId, username })

    // Listen for user joined event
    socket.on("user-joined", ({ users, message }) => {
      setUsers(users)
      toast({
        title: "User Joined",
        description: message,
      })
    })

    // Listen for user left event
    socket.on("user-left", ({ users, message }) => {
      setUsers(users)
      toast({
        title: "User Left",
        description: message,
      })
    })

    // Listen for note updates
    socket.on("note-updated", (data) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === data.noteId ? { ...note, content: data.content, lastEditedBy: data.lastEditedBy } : note,
        ),
      )

      toast({
        title: "Note Updated",
        description: `Note was updated by ${data.lastEditedBy}`,
      })
    })

    // Listen for new notes
    socket.on("note-created", (data) => {
      setNotes((prevNotes) => [...prevNotes, data.note])

      toast({
        title: "New Note Created",
        description: `${data.createdBy} created a new note`,
      })
    })

    // Clean up listeners on unmount or socket change
    return () => {
      socket.off("user-joined")
      socket.off("user-left")
      socket.off("note-updated")
      socket.off("note-created")
    }
  }, [socket, username, roomId, toast])

  // Fetch notes from the API
  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notes/room/${roomId}`)
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      })
    }
  }

  // Handle note selection
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setIsCreatingNote(false)
  }

  // Handle note update
  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      // Update in the database
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, lastEditedBy: username }),
      })

      if (!response.ok) throw new Error("Failed to update note")

      // Update local state
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === noteId ? { ...note, content, lastEditedBy: username } : note)),
      )

      // Emit socket event for real-time update
      if (socket) {
        socket.emit("update-note", {
          roomId,
          noteId,
          content,
          username,
        })
      }
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  // Handle note creation
  const handleCreateNote = async (title: string, content: string) => {
    try {
      // Create in the database
      const response = await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          roomId,
          createdBy: username,
        }),
      })

      if (!response.ok) throw new Error("Failed to create note")

      const newNote = await response.json()

      // Update local state
      setNotes((prevNotes) => [...prevNotes, newNote])
      setIsCreatingNote(false)
      setSelectedNote(newNote)

      // Emit socket event for real-time update
      if (socket) {
        socket.emit("create-note", {
          roomId,
          note: newNote,
          username,
        })
      }
    } catch (error) {
      console.error("Error creating note:", error)
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      })
    }
  }

  // Handle note deletion
  const handleDeleteNote = async (noteId: string) => {
    try {
      // Delete from the database
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete note")

      // Update local state
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId))

      if (selectedNote && selectedNote._id === noteId) {
        setSelectedNote(null)
      }

      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Room: {roomId}</h1>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Leave Room
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-muted p-4 flex flex-col border-r">
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Online Users ({users.length})</h2>
            <UsersList users={users} currentUser={username} />
          </div>

          <Separator className="my-4" />

          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Notes ({notes.length})</h2>
              <Button
                size="sm"
                onClick={() => {
                  setIsCreatingNote(true)
                  setSelectedNote(null)
                }}
              >
                New
              </Button>
            </div>
            <NotesList notes={notes} onSelectNote={handleSelectNote} selectedNoteId={selectedNote?._id} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {isCreatingNote ? (
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">Create New Note</h2>
              <CreateNoteForm onCreateNote={handleCreateNote} />
            </Card>
          ) : selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              username={username}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Welcome to the Collaborative Notes App</h2>
                <p className="text-muted-foreground mb-4">
                  Select a note from the sidebar or create a new one to get started.
                </p>
                <Button onClick={() => setIsCreatingNote(true)}>Create Your First Note</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}

