import { RefObject, useEffect, useRef } from 'react'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { ticketKeys } from './use-tickets'
import { API_BASE_URL, DEFAULT_TIMEOUT, STORAGE_KEYS } from '@/lib/constants'

function deployTicketStreamConnection(eventSourceRef: RefObject<EventSource | null>, token: string, queryClient: QueryClient, onError: (es: EventSource) => void) {
    return () => {
        if (eventSourceRef.current?.readyState === EventSource.OPEN) return

        const url = `${API_BASE_URL}/api/tickets/stream?token=${token}`

        const es = new EventSource(url)
        eventSourceRef.current = es

        es.onopen = () => {
            console.debug('SSE Connected')
        }

        es.onmessage = (event) => {
            if (event.data === '"connected"') return

            try {
                const data = JSON.parse(event.data)
                console.debug('Ticket Update Received:', data)

                queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
                queryClient.invalidateQueries({ queryKey: ['tickets', 'summary'] })

                if (data.ticketId) {
                    queryClient.invalidateQueries({
                        queryKey: ticketKeys.detail(data.ticketId),
                    })
                }
            } catch (err) {
                console.error('Error parsing SSE data', err)
            }
        }

        onError(es)
    }
}


/**
 * Subscribes to SSE ticket updates.
 * Auto-invalidates queries when updates are received.
 */
const useTicketStream = () => {
    const queryClient = useQueryClient()
    const eventSourceRef = useRef<EventSource | null>(null)

    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        if (!token) return

        const streamConnection = deployTicketStreamConnection(eventSourceRef, token, queryClient,
            (es: EventSource) => {
                es.onerror = (err) => {
                    console.warn('SSE Connection lost, retrying in 3s...', err)
                    es.close()
                    eventSourceRef.current = null
                    setTimeout(streamConnection, DEFAULT_TIMEOUT)
                }
            })

        streamConnection()

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
                eventSourceRef.current = null
            }
        }
    }, [queryClient])
}

export { useTicketStream }
