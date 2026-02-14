"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [selectedCourse, setSelectedCourse] = useState("1")

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Topbar selectedCourse={selectedCourse} onCourseChange={setSelectedCourse} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
