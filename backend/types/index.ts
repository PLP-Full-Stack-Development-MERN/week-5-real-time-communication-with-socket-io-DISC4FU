export interface Note {
    _id: string
    title: string
    content: string
    roomId: string
    createdBy: string
    lastEditedBy: string
    createdAt?: Date
    updatedAt?: Date
  }
  
  export interface User {
    id: string
    username: string
  }
  
  