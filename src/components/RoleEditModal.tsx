import React, { useState } from 'react'

interface RoleEditModalProps {
  open: boolean
  onClose: () => void
  onSave: (name: string, permissions: string[]) => Promise<void>
  permissions: any[]
  initialName: string
  initialPerms: string[]
  loading: boolean
}

export default function RoleEditModal({
  open,
  onClose,
  onSave,
  permissions,
  initialName,
  initialPerms,
  loading,
}: RoleEditModalProps) {
  const [name, setName] = useState(initialName)
  const [selectedPerms, setSelectedPerms] = useState<string[]>(initialPerms)

  // Reset state when modal opens
  React.useEffect(() => {
    setName(initialName)
    setSelectedPerms(initialPerms)
  }, [open, initialName, initialPerms])

  return open ? (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[500px] shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Role</h2>
        <input
          className="w-full border p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Role name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-4">
          {permissions.map((p) => (
            <label key={p._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={p._id}
                checked={selectedPerms.includes(p._id)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedPerms([...selectedPerms, p._id])
                  } else {
                    setSelectedPerms(selectedPerms.filter(id => id !== p._id))
                  }
                }}
                disabled={loading}
              />
              {p.name}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, selectedPerms)}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  ) : null
}
