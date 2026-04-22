type Props = {
  open: boolean
  onContinue: () => void
  onStartFresh: () => void
  lastSaved?: string
}

export default function ContinueDraftModal({
  open,
  onContinue,
  onStartFresh,
  lastSaved,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-2">
          Continue your application?
        </h2>

        <p className="text-gray-600 mb-4">
          You have an unfinished application.
        </p>

        {lastSaved && (
          <p className="text-sm text-gray-400 mb-4">
            Last saved: {new Date(lastSaved).toLocaleString()}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onStartFresh}
            className="px-4 py-2 border rounded"
          >
            Start Fresh
          </button>

          <button
            onClick={onContinue}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}