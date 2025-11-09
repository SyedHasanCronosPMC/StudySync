import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { RoomParticipant } from '@/lib/supabase'

interface PresenceState {
  participants: Record<string, RoomParticipant>
}

interface UseRoomPresenceOptions {
  channelName: string
  roomId: string
  initialParticipants?: RoomParticipant[]
  onJoin?: (participant: RoomParticipant) => void
  onLeave?: (participant: RoomParticipant) => void
  onUpdate?: (participant: RoomParticipant) => void
}

export function useRoomPresence({
  channelName,
  roomId,
  initialParticipants,
  onJoin,
  onLeave,
  onUpdate,
}: UseRoomPresenceOptions) {
  const [participants, setParticipants] = useState<Record<string, RoomParticipant>>(() => {
    const map: Record<string, RoomParticipant> = {}
    for (const participant of initialParticipants ?? []) {
      map[participant.user_id] = participant
    }
    return map
  })

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const currentUserIdRef = useRef<string | null>(null)
  const timestampRef = useRef<number>(Date.now())

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      currentUserIdRef.current = user?.id ?? null

      if (!user?.id) return

      const channel = supabase.channel(channelName, {
        config: {
          presence: { key: user.id },
        },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<RoomParticipant>()
          const nextState: Record<string, RoomParticipant> = {}
          for (const [key, presences] of Object.entries(state)) {
            if (presences.length > 0) {
              nextState[key] = presences[presences.length - 1]
            }
          }
          if (!isMounted) return
          setParticipants(nextState)
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          if (!isMounted) return
          if (newPresences.length === 0) return
          const participant = newPresences[newPresences.length - 1]
          setParticipants((prev) => {
            const existing = prev[participant.user_id]
            if (existing && onUpdate) {
              onUpdate(participant)
            } else if (!existing && onJoin) {
              onJoin(participant)
            }
            return { ...prev, [participant.user_id]: participant }
          })
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          if (!isMounted) return
          for (const participant of leftPresences ?? []) {
            setParticipants((prev) => {
              const next = { ...prev }
              delete next[participant.user_id]
              return next
            })
            if (onLeave) onLeave(participant)
          }
        })

      channelRef.current = channel

      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presencePayload: RoomParticipant = {
            id: '',
            room_id: roomId,
            user_id: user.id,
            joined_at: new Date().toISOString(),
            left_at: null,
            status: 'studying',
            current_task: null,
            study_minutes: 0,
            messages_sent: 0,
          }
          await channel.track({ ...presencePayload, joined_at: new Date().toISOString() })
        }
      })
    }

    init()

    const interval = window.setInterval(async () => {
    const channel = channelRef.current
    const userId = currentUserIdRef.current
    if (!channel || !userId) return
    await channel.track({
      user_id: userId,
      room_id: roomId,
      status: 'studying',
      heartbeat: Date.now(),
    })
    }, 20_000)

    return () => {
      isMounted = false
      window.clearInterval(interval)
      const channel = channelRef.current
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [channelName, onJoin, onLeave, onUpdate, initialParticipants])

  useEffect(() => {
    if (!initialParticipants) return
    setParticipants((prev) => {
      const next: Record<string, RoomParticipant> = {}
      for (const participant of initialParticipants) {
        next[participant.user_id] = participant
      }
      return next
    })
  }, [initialParticipants])

  const touch = () => {
    timestampRef.current = Date.now()
  }

  return {
    participants,
    touch,
  }
}

