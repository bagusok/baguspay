import { Button } from '@repo/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import BreadcrumbBasic from '~/components/breadcrumb-basic'
import { apiClient } from '~/utils/axios'

export default function UserSessionsPage() {
  const [sessionToDestroy, setSessionToDestroy] = useState<string | null>(null)

  const sessions = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () =>
      apiClient
        .get('/user/sessions')
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(`Error fetching sessions: ${err.response?.data?.message}` || err.message)
        }),
  })

  const destroySession = useMutation({
    mutationKey: ['destroy-session'],
    mutationFn: (sessionId: string) =>
      apiClient
        .delete(`/user/sessions/${sessionId}/destroy`)
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(`Error destroying session: ${err.response?.data?.message}` || err.message)
        }),
  })

  return (
    <div className="space-y-6">
      <BreadcrumbBasic
        items={[
          {
            label: 'Home',
            href: '/',
          },
          {
            label: 'User',
            href: '/user',
          },
          {
            label: 'Sessions',
          },
        ]}
      />

      <section>
        <h1 className="text-2xl font-bold mb-1">Riwayat Sesi</h1>
        <p className="text-muted-foreground text-sm">Kelola sesi aktif di perangkat Anda.</p>

        <div className="mt-6 flex flex-col gap-4">
          {sessions.isLoading && (
            <p className="text-sm text-muted-foreground animate-pulse">Memuat daftar sesi...</p>
          )}

          {sessions.data?.data?.map((session: any) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card text-card-foreground shadow-sm gap-4 sm:gap-0"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`p-3 rounded-full text-xl sm:text-2xl ${
                    session.is_current_session ? 'bg-primary/10' : 'bg-muted'
                  }`}
                >
                  {session.is_mobile_app || session.device_type === 'mobile'
                    ? '📱'
                    : session.device_name.toLowerCase().includes('mac') ||
                        session.device_name.toLowerCase().includes('safari')
                      ? '🍏'
                      : '💻'}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{session.device_name}</h3>
                  <p className="text-xs text-muted-foreground">
                    IP: {session.ip_address.replace('::ffff:', '')}
                  </p>
                  {session.is_current_session ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      <p className="text-xs text-green-600 font-medium">Sesi Saat Ini</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      Terakhir aktif:{' '}
                      {new Date(session.last_active).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant={session.is_current_session ? 'outline' : 'ghost'}
                size="sm"
                disabled={session.is_current_session || destroySession.isPending}
                className={
                  !session.is_current_session
                    ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                    : ''
                }
                onClick={() => setSessionToDestroy(session.id)}
              >
                Akhiri Sesi
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Dialog
        open={!!sessionToDestroy}
        onOpenChange={(isOpen) => {
          if (!isOpen && !destroySession.isPending) {
            setSessionToDestroy(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akhiri Sesi?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengakhiri sesi ini? Anda akan logout dari perangkat tersebut.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={destroySession.isPending}
              onClick={() => setSessionToDestroy(null)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={destroySession.isPending}
              onClick={() => {
                if (sessionToDestroy) {
                  destroySession.mutate(sessionToDestroy, {
                    onSuccess: () => {
                      sessions.refetch()
                      setSessionToDestroy(null)
                    },
                  })
                }
              }}
            >
              {destroySession.isPending ? 'Menghapus...' : 'Akhiri Sesi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
