"use client"

import { useState, useEffect } from "react"
import { Bell, CheckSquare, Wrench, Calendar as CalendarIcon, GraduationCap, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchNotifications, markNotificationAsRead, markAllAsRead, NotificationDB } from "@/lib/notifications-service"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationDB[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      const data = await fetchNotifications()
      setNotifications(data)
    } catch (error) {
      console.error(error)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error(error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "maintenance": return <Wrench className="h-4 w-4 text-orange-500" />
      case "reminder": return <CalendarIcon className="h-4 w-4 text-blue-500" />
      case "end_term": return <GraduationCap className="h-4 w-4 text-emerald-500" />
      default: return <Info className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground animate-in zoom-in">
              {unreadCount > 9 ? "+9" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <DropdownMenuLabel className="font-semibold px-0 text-base">Notificaciones</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary" onClick={handleMarkAllAsRead}>
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Marcar todo como leído
            </Button>
          )}
        </div>
        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              No tienes notificaciones
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                className={cn(
                  "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-accent/50 transition-colors border-b last:border-0",
                  !notif.is_read ? "bg-primary/5" : ""
                )}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id, { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent)}
              >
                <div className="flex w-full items-start gap-3">
                  <div className={cn(
                    "mt-0.5 p-2 rounded-full",
                    !notif.is_read ? "bg-background shadow-sm" : "bg-muted"
                  )}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "text-sm font-medium leading-none",
                        !notif.is_read ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span className="flex h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className={cn(
                      "text-xs leading-snug line-clamp-2",
                      !notif.is_read ? "text-muted-foreground" : "text-muted-foreground/70"
                    )}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 pt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
