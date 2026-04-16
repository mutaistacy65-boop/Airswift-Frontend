import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import API from '@/lib/api'
import RoleEditModal from '@/components/RoleEditModal'

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{ open: boolean, role: any | null }>({ open: false, role: null })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const rolesRes = await API.get('/roles')
      const permsRes = await API.get('/permissions')
      setRoles(rolesRes.data)
      setPermissions(permsRes.data)
    } catch (e) {
      toast.error('Failed to load data')
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!name) {
      toast.error('Role name required')
      return
    }
    setCreating(true)
    try {
      await API.post('/roles', {
        name,
        permissions: selectedPerms,
      })
      toast.success('Role created')
      setShowModal(false)
      setName('')
      setSelectedPerms([])
      fetchData()
    } catch (e) {
      toast.error('Something went wrong')
    }
    setCreating(false)
  }

  const handleEdit = (role: any) => {
    setEditModal({ open: true, role })
  }

  const handleEditSave = async (newName: string, newPerms: string[]) => {
    if (!editModal.role) return
    setEditing(true)
    try {
      await API.put(`/roles/${editModal.role._id}`,
        { name: newName, permissions: newPerms })
      toast.success('Role updated')
      setEditModal({ open: false, role: null })
      fetchData()
    } catch (e) {
      toast.error('Failed to update role')
    }
    setEditing(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this role?')) return
    setDeletingId(id)
    try {
      await API.delete(`/roles/${id}`)
      toast.success('Role deleted')
      fetchData()
    } catch (e) {
      toast.error('Failed to delete role')
    }
    setDeletingId(null)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">RBAC Manager</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
        >
          + New Role
        </button>
      </div>

      {/* Roles Table */}
      <div className="bg-white shadow rounded-2xl p-4 min-h-[200px]">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="loader" />
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="1.5" d="M12 17v.01M12 13V7m0 10a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>
            <p className="mt-2">No roles created yet</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Role</th>
                <th className="p-2">Permissions</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{role.name}</td>
                  <td className="p-2">
                    {role.permissions.length} permissions
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEdit(role)}
                    >Edit</button>
                          {/* Edit Modal */}
                          <RoleEditModal
                            open={editModal.open}
                            onClose={() => setEditModal({ open: false, role: null })}
                            onSave={handleEditSave}
                            permissions={permissions}
                            initialName={editModal.role?.name || ''}
                            initialPerms={editModal.role?.permissions || []}
                            loading={editing}
                          />
                    <button
                      className="text-red-500 hover:underline disabled:opacity-50"
                      disabled={deletingId === role._id}
                      onClick={() => handleDelete(role._id)}
                    >
                      {deletingId === role._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[500px] shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Create Role</h2>
            {/* Role Name */}
            <input
              className="w-full border p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Role name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={creating}
            />
            {/* Permissions Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
              {permissions.map((p) => (
                <label key={p._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={p._id}
                    checked={selectedPerms.includes(p._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPerms([...selectedPerms, p._id])
                      } else {
                        setSelectedPerms(selectedPerms.filter((id) => id !== p._id))
                      }
                    }}
                    disabled={creating}
                  />
                  {p.name}
                </label>
              ))}
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={creating}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {creating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
