"use client"
import { useState } from "react"
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks"

interface TasksTabProps {
  leadId: string
  onSaved: (msg: string) => void
}

export default function TasksTab({ leadId, onSaved }: TasksTabProps) {
  const { data: tasks = [] } = useTasks(leadId)
  const createTask = useCreateTask(leadId)
  const updateTask = useUpdateTask(leadId)
  const deleteTask = useDeleteTask(leadId)

  const [newTaskType, setNewTaskType] = useState("")

  const handleAddTask = () => {
    if (!newTaskType.trim()) return
    createTask.mutate({ task_type: newTaskType }, {
      onSuccess: () => {
        setNewTaskType("")
        onSaved("Task added")
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={newTaskType}
          onChange={(e) => setNewTaskType(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleAddTask}
          disabled={createTask.isPending || !newTaskType.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
        >
          Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No tasks yet</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() =>
                  updateTask.mutate({
                    taskId: task.id,
                    payload: { is_done: !task.is_done },
                  })
                }
                className="w-5 h-5 cursor-pointer"
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.is_done ? "line-through text-slate-500" : "text-slate-900"}`}>
                  {task.task_type}
                </p>
                {task.notes && <p className="text-xs text-slate-500 mt-1">{task.notes}</p>}
              </div>
              <button
                onClick={() => deleteTask.mutate(task.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
