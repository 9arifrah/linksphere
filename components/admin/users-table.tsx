'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, User as UserIcon, Edit, Trash2, Plus } from 'lucide-react'
import { UserFormDialog } from '@/components/admin/user-form-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type User = {
  id: string
  email: string
  display_name?: string
  custom_slug?: string
  is_admin?: boolean
  created_at: string
}

type UsersTableProps = {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | undefined>()
  const [loading, setLoading] = useState(false)

  const handleEdit = (user: User) => {
    // Ensure is_admin is properly set when passing user to dialog
    const userWithAdmin = {
      ...user,
      is_admin: user.is_admin ?? false
    }
    console.log('[v0] Passing user to dialog:', userWithAdmin)
    setSelectedUser(userWithAdmin)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setSelectedUser(undefined)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setDeleteOpen(false)
        setUserToDelete(undefined)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menghapus user')
      }
    } catch (error) {
      console.error('[v0] Error deleting user:', error)
      alert('Terjadi kesalahan saat menghapus user')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteOpen(true)
  }
  return (
    <>
      <Card className="shadow-slack-md border-slate-700/50 bg-slate-800/50 backdrop-blur">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
              <span className="text-white text-sm sm:text-base">Daftar Pengguna ({users.length})</span>
            </div>
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tambah User</span>
              <span className="inline sm:hidden">Tambah</span>
            </Button>
          </CardTitle>
        </CardHeader>
      
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {users.map((user: any) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 rounded-lg border border-slate-700/50 p-3 sm:p-4 hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                <div className="font-medium text-white truncate text-xs sm:text-sm">
                  {user.display_name || 'Tanpa Nama'}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 break-all">{user.email}</div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-slate-400">
                  {user.custom_slug ? (
                    <a
                      href={`/${user.custom_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline truncate"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      <span className="truncate">{user.custom_slug}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500">Belum ada slug</span>
                  )}
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="text-slate-500">Bergabung {new Date(user.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 sm:flex-nowrap">
                <Badge variant={user.is_admin ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                  {user.is_admin ? 'Admin' : 'Regular'}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(user)}
                    className="h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDelete(user)}
                    className="h-8 w-8 sm:h-9 sm:w-9 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-700/30 p-8 sm:p-12 text-center">
              <UserIcon className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 text-slate-500" />
              <p className="text-xs sm:text-sm text-slate-400">Belum ada pengguna</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Hapus User?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Apakah Anda yakin ingin menghapus user "{userToDelete?.email}"? 
              Tindakan ini tidak dapat dibatalkan dan semua data terkait user ini akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}