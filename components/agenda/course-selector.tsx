"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { formatCourseName } from "@/lib/types"

interface Course {
  id: string
  subject: string
  grade: string
  group_number: string
}

interface CourseSelectorProps {
  value?: string
  onChange: (courseId: string | undefined) => void
}

export function CourseSelector({ value, onChange }: CourseSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("courses")
      .select("id, subject, grade, group_number")
      .eq("user_id", user.id) // 🔥 filtro clave
      .order("subject")

    if (error) throw error

    setCourses(data || [])
  } catch (error) {
    console.error("Error loading courses:", error)
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="space-y-2">
      <Label htmlFor="course">Curso (opcional)</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val === "none" ? undefined : val)}
      >
        <SelectTrigger id="course" disabled={loading}>
          <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar curso"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sin curso asignado</SelectItem>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {formatCourseName(course.subject, course.grade, course.group_number)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}