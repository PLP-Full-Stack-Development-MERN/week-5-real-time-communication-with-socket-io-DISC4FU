import type { User } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface UsersListProps {
  users: User[]
  currentUser: string
}

export default function UsersList({ users, currentUser }: UsersListProps) {
  return (
    <ScrollArea className="h-[150px]">
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users online</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center gap-2 p-2 rounded">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">
                {user.username}
                {user.username === currentUser && (
                  <Badge variant="outline" className="ml-2">
                    You
                  </Badge>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}

