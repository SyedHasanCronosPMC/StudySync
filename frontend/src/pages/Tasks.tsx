import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Task } from '@/lib/supabase'
import { callAppFunction } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Check, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { TaskDecomposer } from '@/components/tasks/TaskDecomposer'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

type TaskStatus = Task['status']

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Ready',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
}

const statusOrder: TaskStatus[] = ['pending', 'in_progress', 'completed', 'skipped']

export default function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDuration, setNewTaskDuration] = useState(25)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')

  useEffect(() => {
    loadTasks()
  }, [])

  const orderedTasks = useMemo(() => {
    const data = [...tasks].sort((a, b) => {
      const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      if (statusDiff !== 0) return statusDiff
      return (a.position ?? 0) - (b.position ?? 0)
    })
    if (filterStatus === 'all') return data
    return data.filter((task) => task.status === filterStatus)
  }, [tasks, filterStatus])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      completed: [],
      skipped: [],
    }
    for (const task of tasks) {
      grouped[task.status].push(task)
    }
    for (const status of statusOrder) {
      grouped[status].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    }
    return grouped
  }, [tasks])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const { tasks: fetched } = await callAppFunction<{ tasks: Task[] }>('tasks.list')
      setTasks(fetched)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTaskTitle.trim()) return
    setCreating(true)
    try {
      await callAppFunction('tasks.create', {
        title: newTaskTitle.trim(),
        estimated_minutes: newTaskDuration,
      })
      setNewTaskTitle('')
      setNewTaskDuration(25)
      await loadTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Unable to create task. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const updateTaskStatus = async (task: Task, status: TaskStatus) => {
    try {
      await callAppFunction('tasks.updateStatus', {
        task_id: task.id,
        status,
      })
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? { ...item, status, completed_at: status === 'completed' ? new Date().toISOString() : item.completed_at } : item)),
      )
    } catch (error) {
      console.error('Error updating task status:', error)
      alert('Unable to update task. Please try again.')
    }
  }

  const reorderTasks = async (status: TaskStatus, taskId: string, direction: 'up' | 'down') => {
    const list = tasksByStatus[status]
    const index = list.findIndex((t) => t.id === taskId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= list.length) return

    const reordered = [...list]
    const [task] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, task)

    const updates = reordered.map((item, position) => ({
      task_id: item.id,
      position,
      status,
    }))

    try {
      await callAppFunction('tasks.reorder', { updates })
      await loadTasks()
    } catch (error) {
      console.error('Error reordering tasks:', error)
      alert('Unable to reorder tasks. Please try again.')
    }
  }

  const handleStartFocus = async (task: Task) => {
    if (task.status !== 'in_progress') {
      await updateTaskStatus(task, 'in_progress')
    }
    navigate(`/pomodoro?taskId=${task.id}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-8">
        <PageContainer className="flex flex-col gap-6">
          <PageBreadcrumbs
            className="text-xs sm:text-sm"
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Tasks' },
            ]}
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Button onClick={() => navigate('/dashboard')} className="mb-4 inline-flex items-center gap-2 md:mb-0">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-semibold text-foreground">Tasks & Rituals</h1>
              <p className="text-sm text-muted-foreground">
                Break work into calm, doable steps. Update statuses as you progress and jump into a focus session when you&apos;re ready.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
                Filter
              </Label>
              <select
                id="status-filter"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as TaskStatus | 'all')}
              >
                <option value="all">All statuses</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Capture a quick task</CardTitle>
              <CardDescription>Add a simple item to your queue, or use AI breakdown for bigger goals.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <Label htmlFor="new-task" className="sr-only">
                    Task title
                  </Label>
                  <Input
                    id="new-task"
                    placeholder="e.g., Outline essay intro (15 min)"
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="task-duration" className="text-sm text-muted-foreground">
                    Duration
                  </Label>
                  <Input
                    id="task-duration"
                    type="number"
                    min={5}
                    className="w-24"
                    value={newTaskDuration}
                    onChange={(event) => setNewTaskDuration(Math.max(5, Number(event.target.value)))}
                  />
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Adding...' : 'Add Task'}
                </Button>
              </form>
              <div className="mt-6">
                <TaskDecomposer onTaskCreated={loadTasks} />
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading tasks...</div>
          ) : orderedTasks.length === 0 ? (
            <Card className="border border-border bg-card">
              <CardContent className="py-12 text-center text-muted-foreground">No tasks yet. Add a quick item above or break down a bigger project.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {statusOrder
                .filter((status) => filterStatus === 'all' || filterStatus === status)
                .map((status) => {
                  const list = tasksByStatus[status]
                  if (list.length === 0) return null
                  return (
                    <Card key={status} className="border border-border bg-card">
                      <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-foreground">{statusLabels[status]}</CardTitle>
                        <Badge variant="outline">{list.length}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {list.map((task, index) => (
                          <div key={task.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                                  {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                                </div>
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{task.estimated_minutes} min</Badge>
                                {task.actual_minutes ? <Badge variant="outline">Logged {task.actual_minutes} min</Badge> : null}
                                {task.completed_at ? (
                                  <Badge variant="outline" className="text-primary">
                                    Done
                                  </Badge>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {status !== 'completed' && (
                                  <Button size="sm" variant="outline" onClick={() => handleStartFocus(task)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Focus Timer
                                  </Button>
                                )}
                                {status !== 'completed' && (
                                  <Button size="sm" variant="ghost" onClick={() => updateTaskStatus(task, 'completed')}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Complete
                                  </Button>
                                )}
                                {status !== 'pending' && (
                                  <Button size="sm" variant="ghost" onClick={() => updateTaskStatus(task, 'pending')}>
                                    Reset
                                  </Button>
                                )}
                              </div>
                              {list.length > 1 && (
                                <div className="flex items-center gap-2">
                                  <Button size="icon" variant="ghost" disabled={index === 0} onClick={() => reorderTasks(status, task.id, 'up')}>
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" disabled={index === list.length - 1} onClick={() => reorderTasks(status, task.id, 'down')}>
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </PageContainer>
      </main>

      <SiteFooter />
    </div>
  )
}

