"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, BookOpen, MessageSquare, Bell, Calendar, Phone, Mail, MapPin, Heart, Shield, ArrowLeft } from "lucide-react"
import type { StudentDB, Grades, GradeItem } from "@/lib/types"
import { calculateAge, emptyGrades } from "@/lib/types"
import { StudentProfile } from "@/components/students/student-profile"

interface StudentDetailPageProps {
  params: {
    id: string
  }
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    // Unwrap params si es una Promise
    const unwrapParams = async () => {
      const resolvedParams = await Promise.resolve(params)
      setStudentId(resolvedParams.id)
    }
    
    unwrapParams()
  }, [params])

  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Student Profile Component */}
      <StudentProfile studentId={studentId} />
    </div>
  )
}