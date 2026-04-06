import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { adminService } from '@/services/adminService'
import { useNotification } from '@/context/NotificationContext'
import Loader from '@/components/Loader'
import { GripVertical } from 'lucide-react'

interface Application {
  _id: string
  fullName: string
  email: string
  jobId: { title: string } | string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'interview-scheduled'
  cv?: string
  appliedDate?: string
}

const STATUSES = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-100', borderColor: 'border-yellow-300' },
  { id: 'reviewed', label: 'Reviewed', color: 'bg-blue-100', borderColor: 'border-blue-300' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100', borderColor: 'border-green-300' },
  { id: 'interview-scheduled', label: 'Interviews', color: 'bg-purple-100', borderColor: 'border-purple-300' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-100', borderColor: 'border-red-300' },
]

interface ApplicationPipelineProps {
  applications: Application[]
  onStatusUpdate?: (appId: string, newStatus: string) => void
}

const ApplicationPipeline: React.FC<ApplicationPipelineProps> = ({ applications, onStatusUpdate }) => {
  const { addNotification } = useNotification()
  const [items, setItems] = useState<Application[]>(applications)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setItems(applications)
  }, [applications])

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    // If dropped outside a valid zone
    if (!destination) {
      return
    }

    // If dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const draggedApp = items.find(app => app._id === draggableId)
    if (!draggedApp) return

    const newStatus = destination.droppableId

    try {
      setUpdating(true)

      // Update locally first for optimistic UI
      setItems(
        items.map(app =>
          app._id === draggableId ? { ...app, status: newStatus as any } : app
        )
      )

      // Update on backend
      await adminService.updateApplicationStatus(draggableId, newStatus)
      addNotification(`${draggedApp.fullName} moved to ${STATUSES.find(s => s.id === newStatus)?.label}`, 'success')

      if (onStatusUpdate) {
        onStatusUpdate(draggableId, newStatus)
      }
    } catch (error: any) {
      // Revert on error
      setItems(applications)
      addNotification(error?.message || 'Failed to update status', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const getApplicationsByStatus = (status: string) => {
    return items.filter(app => app.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUSES.map(statusCol => {
          const appsInStatus = getApplicationsByStatus(statusCol.id)

          return (
            <Droppable droppableId={statusCol.id} key={statusCol.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 rounded-lg border-2 min-h-96 ${
                    snapshot.isDraggingOver ? 'bg-blue-50 border-blue-400' : `${statusCol.color} ${statusCol.borderColor}`
                  } transition-all`}
                >
                  {/* Column Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{statusCol.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{appsInStatus.length} applicants</p>
                  </div>

                  {/* Applications in this status */}
                  <div className="space-y-3">
                    {appsInStatus.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No applicants</p>
                      </div>
                    ) : (
                      appsInStatus.map((app, index) => (
                        <Draggable
                          key={app._id}
                          draggableId={app._id}
                          index={index}
                          isDragDisabled={updating}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-move transition-all ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 opacity-90' : 'hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <GripVertical size={16} className="mt-1 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm truncate">{app.fullName}</h4>
                                  <p className="text-xs text-gray-500 truncate">{app.email}</p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {typeof app.jobId === 'object' ? app.jobId.title : app.jobId}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                  </div>

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )
        })}
      </div>
    </DragDropContext>
  )
}

export default ApplicationPipeline
