import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { callAppFunction } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Plus, Clock, Loader2, SignalHigh, UserCheck } from 'lucide-react'
import type { StudyRoom, RoomParticipant, RoomSummary } from '@/lib/supabase'
import { useRoomPresence } from '@/hooks/useRoomPresence'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageBreadcrumbs } from '@/components/layout/PageBreadcrumbs'

export default function StudyRooms() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<StudyRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: '',
    subject: '',
    max_participants: 10,
  })
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null)
  const [roomSummary, setRoomSummary] = useState<RoomSummary | null>(null)
  const [roomLoading, setRoomLoading] = useState(false)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    loadRooms()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
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

  useEffect(() => {
    if (!loading && rooms.length > 0 && !selectedRoom) {
      openRoom(rooms[0].id)
    }
  }, [loading, rooms, selectedRoom])

  const loadRooms = async () => {
    try {
    const { rooms: fetchedRooms } = await callAppFunction<{ rooms: StudyRoom[] }>('studyRooms.list')
    setRooms(fetchedRooms)
  } catch (error) {
    console.error('Error loading rooms:', error)
  } finally {
    setLoading(false)
  }
}

  const openRoom = async (roomId: string) => {
    const roomData = rooms.find((room) => room.id === roomId) ?? selectedRoom
    if (roomData) {
      setSelectedRoom(roomData)
    }
    setRoomLoading(true)
    setRoomError(null)
    try {
      const summary = await callAppFunction<RoomSummary>('studyRooms.status', { roomId })
      setRoomSummary(summary)
      if (summary?.room) {
        setSelectedRoom(summary.room as StudyRoom)
        setRooms((prev) =>
          prev.map((roomItem) => (roomItem.id === summary.room.id ? (summary.room as StudyRoom) : roomItem)),
        )
      }
    } catch (error) {
      console.error('Error loading room summary:', error)
      setRoomError('Unable to load room activity')
    } finally {
      setRoomLoading(false)
    }
  }

  const createRoom = async () => {
    try {
      await callAppFunction('studyRooms.create', newRoom)
      setShowCreateForm(false)
      setNewRoom({ name: '', subject: '', max_participants: 10 })
      loadRooms()
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      const result = await callAppFunction<{ joined?: boolean; alreadyJoined?: boolean }>('studyRooms.join', {
        roomId,
      })

      if (result.alreadyJoined) {
        alert('You are already in this room!')
        return
      }

      alert('Joined room successfully!')
      loadRooms()
      openRoom(roomId)
    } catch (error: any) {
      console.error('Error joining room:', error)
      if (error.code === '23505') {
        alert('You are already in this room!')
      }
    }
  }

  const leaveRoom = async (roomId: string) => {
    try {
      await callAppFunction('studyRooms.leave', { roomId })
      setSelectedRoom(null)
      setRoomSummary(null)
      loadRooms()
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-8">
        <PageContainer className="space-y-6">
          <PageBreadcrumbs
            className="text-xs sm:text-sm"
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Study Rooms' },
            ]}
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </div>

          <h1 className="text-3xl font-semibold text-foreground">Study Rooms</h1>
          <p className="text-muted-foreground">
            Join others who are studying right now. Anonymous and supportive.
          </p>

          {showCreateForm && (
            <Card className="mb-8 border-border bg-card">
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

          <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
            <div>
              {loading ? (
                <Card className="border-border bg-card">
                  <CardContent className="py-12 text-center text-muted-foreground">Loading rooms...</CardContent>
                </Card>
              ) : rooms.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="py-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 text-lg font-medium">No active study rooms</p>
                    <p className="mb-4 text-muted-foreground">Be the first to create one!</p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Room
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <Card
                      key={room.id}
                      className="cursor-pointer border-border bg-card transition-colors hover:border-primary"
                      onClick={() => openRoom(room.id)}
                    >
                      <CardHeader className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-foreground">{room.name}</CardTitle>
                          <Badge variant={room.is_active ? 'default' : 'outline'} className="capitalize">
                            {room.is_active ? 'Live' : 'Quiet'}
                          </Badge>
                        </div>
                        {room.subject && <CardDescription>{room.subject}</CardDescription>}
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {room.current_participants} / {room.max_participants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {room.session_duration}m / {room.break_duration}m
                          </span>
                        </div>
                        {room.average_focus ? (
                          <div className="flex items-center gap-2">
                            <SignalHigh className="h-4 w-4" />
                            <span>Focus {room.average_focus}/10</span>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              {selectedRoom ? (
                <RoomDetailPanel
                  room={selectedRoom}
                  roomSummary={roomSummary}
                  roomLoading={roomLoading}
                  roomError={roomError}
                  currentUserId={currentUserId}
                  onJoin={() => joinRoom(selectedRoom.id)}
                  onLeave={() => leaveRoom(selectedRoom.id)}
                  onRefresh={() => openRoom(selectedRoom.id)}
                />
              ) : (
                <Card className="h-full border-border bg-card">
                  <CardContent className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Users className="h-10 w-10" />
                    <p className="text-sm">Select a room to view presence and join the session.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </div>
  )
}

interface RoomDetailPanelProps {
  room: StudyRoom
  roomSummary: RoomSummary | null
  roomLoading: boolean
  roomError: string | null
  currentUserId: string | null
  onJoin: () => void
  onLeave: () => void
  onRefresh: () => void
}

function RoomDetailPanel({
  room,
  roomSummary,
  roomLoading,
  roomError,
  currentUserId,
  onJoin,
  onLeave,
  onRefresh,
}: RoomDetailPanelProps) {
  const initialParticipants = React.useMemo(() => {
    if (!roomSummary?.participants) return undefined
    return roomSummary.participants.map(({ profile, ...rest }) => rest)
  }, [roomSummary])

  const refreshRef = React.useRef(onRefresh)
  React.useEffect(() => {
    refreshRef.current = onRefresh
  }, [onRefresh])

  const { participants } = useRoomPresence({
    channelName: `room:${room.id}`,
    roomId: room.id,
    initialParticipants,
    onJoin: () => refreshRef.current(),
    onLeave: () => refreshRef.current(),
  })

  const presenceParticipants = React.useMemo(() => Object.values(participants), [participants])

  const profileLookup = React.useMemo(() => {
    const map = new Map<string, RoomSummary['participants'][number]['profile'] | null>()
    for (const entry of roomSummary?.participants ?? []) {
      map.set(entry.user_id, entry.profile ?? null)
    }
    return map
  }, [roomSummary])

  const displayParticipants = React.useMemo(() => {
    if (presenceParticipants.length > 0) {
      return presenceParticipants.map((participant) => ({
        participant,
        profile: profileLookup.get(participant.user_id) ?? null,
      }))
    }
    return (roomSummary?.participants ?? []).map(({ profile, ...rest }) => ({
      participant: rest,
      profile: profile ?? null,
    }))
  }, [presenceParticipants, profileLookup, roomSummary])

  const isMember = currentUserId ? displayParticipants.some((item) => item.participant.user_id === currentUserId) : false
  const capacityReached =
    (roomSummary?.room?.current_participants ?? room.current_participants ?? 0) >= room.max_participants && !isMember

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">{room.name}</CardTitle>
            {room.subject && <CardDescription>{room.subject}</CardDescription>}
          </div>
          <Badge variant={room.is_active ? 'default' : 'outline'}>{room.is_active ? 'Live now' : 'Quiet'}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {roomSummary?.room?.current_participants ?? room.current_participants ?? 0} / {room.max_participants}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {room.session_duration} focus / {room.break_duration} break
            </span>
          </div>
          {roomSummary?.room?.average_focus ? (
            <div className="flex items-center gap-2">
              <SignalHigh className="h-4 w-4" />
              <span>Focus {roomSummary.room.average_focus}/10</span>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {isMember ? (
            <Button variant="outline" onClick={onLeave}>
              Leave Room
            </Button>
          ) : (
            <Button onClick={onJoin} disabled={capacityReached}>
              {capacityReached ? 'Room Full' : 'Join Room'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roomLoading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing presence...</span>
          </div>
        ) : roomError ? (
          <p className="text-sm text-destructive">{roomError}</p>
        ) : displayParticipants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No one is actively studying here yet. Be the first to join!</p>
        ) : (
          <div className="space-y-3">
            {displayParticipants.map(({ participant, profile }) => (
              <div
                key={participant.user_id}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? ''} /> : null}
                    <AvatarFallback>{profile?.display_name?.slice(0, 2).toUpperCase() ?? '👤'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {profile?.display_name ?? 'Anonymous'}
                      {participant.user_id === currentUserId ? ' (You)' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{participant.status.replace('_', ' ')}</p>
                  </div>
                </div>
                {profile?.current_streak ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {profile.current_streak}d streak
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}