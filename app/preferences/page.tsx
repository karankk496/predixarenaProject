// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { ChevronLeft, MoreVertical, Shield, UserX } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { Snackbar } from "@mui/material"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Separator } from "@/components/ui/separator"

// interface UserData {
//   id: string
//   email: string
//   firstName: string | null
//   lastName: string | null
//   displayName: string | null
//   role: 'ADMIN' | 'OPS' | 'GENERAL'
//   isSuperUser: boolean
//   createdAt?: string
//   updatedAt?: string
// }

// export default function PreferencesPage() {
//   const [users, setUsers] = useState<UserData[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [openSnackbar, setOpenSnackbar] = useState(false)
//   const [snackbarMessage, setSnackbarMessage] = useState('')
//   const router = useRouter()

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const token = localStorage.getItem('token')
//       const userData = localStorage.getItem('userData')

//       if (!token || !userData) {
//         router.push('/login')
//         return
//       }

//       const parsedUserData = JSON.parse(userData)
//       if (!parsedUserData.isSuperUser) {
//         router.push('/')
//         setSnackbarMessage('Access denied: Admin privileges required')
//         setOpenSnackbar(true)
//         return
//       }

//       try {
//         const response = await fetch('/api/admin/users', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         })

//         if (!response.ok) {
//           const errorData = await response.json()
//           throw new Error(errorData.error || 'Failed to fetch users')
//         }

//         const data = await response.json()
//         setUsers(data.users)
//       } catch (error) {
//         console.error('Error fetching users:', error)
//         setSnackbarMessage(error instanceof Error ? error.message : 'Failed to load users')
//         (true)
//         if (error instanceof Error && error.message === 'Unauthorized') {
//           router.push('/')
//         }
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchUsers()
//   }, [router])

//   const handleUserAction = async (userId: string, action: 'promote_admin' | 'promote_ops' | 'delete') => {
//     try {
//       const response = await fetch(`/api/admin/users/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ action }),
//       })

//       if (!response.ok) {
//         throw new Error('Failed to update user')
//       }

//       const updatedUsers = users.map(user => {
//         if (user.id === userId) {
//           return {
//             ...user,
//             isSuperUser: action === 'promote_admin' ? true : user.isSuperUser,
//             role: action === 'promote_ops' ? 'OPS' : user.role
//           }
//         }
//         return user
//       })

//       setUsers(action === 'delete' ? users.filter(user => user.id !== userId) : updatedUsers)
//       setSnackbarMessage(
//         action === 'promote_admin' 
//           ? 'User promoted to Admin successfully' 
//           : action === 'promote_ops'
//             ? 'User promoted to OPS successfully'
//             : 'User deleted successfully'
//       )
//       setOpenSnackbar(true)
//     } catch (error) {
//       console.error('Error updating user:', error)
//       setSnackbarMessage('Failed to update user')
//       setOpenSnackbar(true)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="container max-w-4xl py-4">
//           <div className="flex items-center justify-center py-12">
//             <p className="text-lg text-muted-foreground">Loading users...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container max-w-4xl py-4">
//         <Button 
//           variant="ghost" 
//           size="sm" 
//           onClick={() => router.back()}
//           className="flex items-center gap-2 mb-4"
//         >
//           <ChevronLeft className="h-4 w-4" />
//           Back
//         </Button>

//         <Card className="shadow-lg">
//           <CardHeader className="pb-4">
//             <CardTitle className="text-2xl font-bold">User Management</CardTitle>
//           </CardHeader>
          
//           <CardContent>
//             <div className="space-y-6">
//               {users.map((user) => (
//                 <div key={user.id}>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <Avatar className="h-10 w-10">
//                         <AvatarFallback>
//                           {user.firstName?.[0]}{user.lastName?.[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <h3 className="font-medium">
//                           {user.displayName || `${user.firstName} ${user.lastName}` || 'User'}
//                         </h3>
//                         <div className="flex items-center gap-2">
//                           <p className="text-sm text-muted-foreground">{user.email}</p>
//                           <span className="text-xs px-2 py-1 rounded-full bg-muted">
//                             {user.role}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       {user.isSuperUser && (
//                         <Shield className="h-4 w-4 text-primary" />
//                       )}
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="sm">
//                             <MoreVertical className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           {!user.isSuperUser && (
//                             <DropdownMenuItem
//                               onClick={() => handleUserAction(user.id, 'promote_admin')}
//                               className="text-primary"
//                             >
//                               <Shield className="h-4 w-4 mr-2" />
//                               Promote to Admin
//                             </DropdownMenuItem>
//                           )}
//                           {user.role === 'GENERAL' && (
//                             <DropdownMenuItem
//                               onClick={() => handleUserAction(user.id, 'promote_ops')}
//                               className="text-blue-600"
//                             >
//                               <Shield className="h-4 w-4 mr-2" />
//                               Promote to OPS
//                             </DropdownMenuItem>
//                           )}
//                           <DropdownMenuItem
//                             onClick={() => handleUserAction(user.id, 'delete')}
//                             className="text-destructive"
//                           >
//                             <UserX className="h-4 w-4 mr-2" />
//                             Delete User
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </div>
//                   </div>
//                   <Separator className="mt-4" />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Snackbar
//         open={openSnackbar}
//         autoHideDuration={3000}
//         onClose={() => setOpenSnackbar(false)}
//         message={snackbarMessage}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       />
//     </div>
//   )
// } 