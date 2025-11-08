import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, Plus, Clock, User } from 'lucide-react'
import type { StudyRoom } from '@/lib/supabase'

export default function StudyRooms() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [rooms, setRooms] = useState<StudyRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: '',
    subject: '',
    max_participants: 10,
  })

  useEffect(() => {
    loadRooms()
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('study_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_rooms' }, () => {
        loadRooms()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('study_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async () => {
    try {
      const { error } = await supabase.from('study_rooms').insert({
        ...newRoom,
        created_by: user.id,
        is_active: true,
      })

      if (error) throw error

      setShowCreateForm(false)
      setNewRoom({ name: '', subject: '', max_participants: 10 })
      loadRooms()
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const { error } = await supabase.from('room_participants').insert({
        room_id: roomId,
        user_id: user.id,
        status: 'studying',
      })

      if (error) throw error
      // Navigate to room detail or show success
      alert('Joined room successfully!')
    } catch (error: any) {
      console.error('Error joining room:', error)
      if (error.code === '23505') {
        alert('You are already in this room!')
      }
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Study Rooms
        </h1>
        <p className="text-muted-foreground mb-8">Join others who are studying right now. Anonymous and supportive.</p>

        {/* Create Room Form */}
        {showCreateForm && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Create a Study Room</CardTitle>
              <CardDescription>Set up a space for focused studying</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  placeholder="e.g., Math Study Session"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Calculus"
                  value={newRoom.subject}
                  onChange={(e) => setNewRoom({ ...newRoom, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-participants">Max Participants</Label>
                <select
                  id="max-participants"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={newRoom.max_participants}
                  onChange={(e) => setNewRoom({ ...newRoom, max_participants: parseInt(e.target.value) })}
                >
                  <option value={5}>5 people</option>
                  <option value={10}>10 people</option>
                  <option value={15}>15 people</option>
                  <option value={20}>20 people</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={createRoom} disabled={!newRoom.name}>
                  Create Room
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No active study rooms</p>
              <p className="text-muted-foreground mb-4">Be the first to create one!</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="bg-card border-border hover:border-purple-600 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  {room.subject && <CardDescription>{room.subject}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {room.current_participants} / {room.max_participants}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{room.session_duration}m</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => joinRoom(room.id)}
                    disabled={room.current_participants >= room.max_participants}
                  >
                    {room.current_participants >= room.max_participants ? 'Room Full' : 'Join Room'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}