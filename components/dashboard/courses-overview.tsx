import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { courses } from "@/lib/data"
import { Users, Clock } from "lucide-react"
import Link from "next/link"

export function CoursesOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Cursos Activos</CardTitle>
        <Link href="/cursos">
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/cursos/${course.id}`}>
              <div className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${course.color}`} />
                  <span className="font-medium">{course.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">{course.grade}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.students} estudiantes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.schedule.split(" ")[0]}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
