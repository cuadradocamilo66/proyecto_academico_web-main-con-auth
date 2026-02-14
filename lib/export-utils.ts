import * as XLSX from 'xlsx'
import type { Student, GradeItem } from '@/lib/types'

type Period = "p1" | "p2" | "p3" | "p4"

// ===========================
// UTILS
// ===========================

const average = (grades: GradeItem[] = []) => {
  if (!grades.length) return null
  const sum = grades.reduce((acc, g) => acc + g.value, 0)
  return Number((sum / grades.length).toFixed(2))
}

const getPeriodLabel = (period: Period) => {
  const labels = {
    p1: "Periodo 1",
    p2: "Periodo 2",
    p3: "Periodo 3",
    p4: "Periodo 4"
  }
  return labels[period]
}

// ===========================
// EXPORTAR A EXCEL
// ===========================

export function exportToExcel(students: Student[], courseName?: string) {
  // Crear datos para la hoja
  const data = students.map((student) => {
    const p1Avg = average(student.grades?.p1)
    const p2Avg = average(student.grades?.p2)
    const p3Avg = average(student.grades?.p3)
    const p4Avg = average(student.grades?.p4)
    
    const allGrades = [p1Avg, p2Avg, p3Avg, p4Avg].filter(g => g !== null) as number[]
    const finalAverage = allGrades.length > 0 
      ? (allGrades.reduce((acc, g) => acc + g, 0) / allGrades.length).toFixed(2)
      : "N/A"

    return {
      "Estudiante": student.fullName,
      "Documento": student.documentNumber,
      "Curso": student.courseName || "Sin curso",
      "Periodo 1": p1Avg !== null ? p1Avg.toFixed(1) : "—",
      "Periodo 2": p2Avg !== null ? p2Avg.toFixed(1) : "—",
      "Periodo 3": p3Avg !== null ? p3Avg.toFixed(1) : "—",
      "Periodo 4": p4Avg !== null ? p4Avg.toFixed(1) : "—",
      "Promedio Final": finalAverage,
    }
  })

  // Crear libro de trabajo
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  
  // Ajustar anchos de columna
  const columnWidths = [
    { wch: 25 }, // Estudiante
    { wch: 15 }, // Documento
    { wch: 20 }, // Curso
    { wch: 12 }, // P1
    { wch: 12 }, // P2
    { wch: 12 }, // P3
    { wch: 12 }, // P4
    { wch: 15 }, // Promedio Final
  ]
  worksheet['!cols'] = columnWidths

  XLSX.utils.book_append_sheet(workbook, worksheet, "Calificaciones")

  // Generar nombre de archivo
  const fileName = courseName 
    ? `Calificaciones_${courseName}_${new Date().toISOString().split('T')[0]}.xlsx`
    : `Calificaciones_${new Date().toISOString().split('T')[0]}.xlsx`

  // Descargar archivo
  XLSX.writeFile(workbook, fileName)
}

// ===========================
// EXPORTAR A PDF
// ===========================

export function exportToPDF(students: Student[], courseName?: string) {
  // Crear ventana con el contenido a imprimir
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes para exportar a PDF')
    return
  }

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Crear contenido HTML para imprimir
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Calificaciones</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1f2937;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 28px;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .header h2 {
          font-size: 18px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .header p {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 8px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        thead {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
        }
        
        th {
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        th.center {
          text-align: center;
        }
        
        tbody tr {
          border-bottom: 1px solid #e5e7eb;
        }
        
        tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        tbody tr:hover {
          background-color: #f3f4f6;
        }
        
        td {
          padding: 12px 8px;
          font-size: 13px;
        }
        
        td.center {
          text-align: center;
          font-weight: 600;
        }
        
        .grade-excellent {
          color: #10b981;
        }
        
        .grade-good {
          color: #3b82f6;
        }
        
        .grade-acceptable {
          color: #f59e0b;
        }
        
        .grade-poor {
          color: #ef4444;
        }
        
        .grade-none {
          color: #9ca3af;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          @page {
            margin: 1cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte de Calificaciones</h1>
        ${courseName ? `<h2>${courseName}</h2>` : ''}
        <p>Generado el ${currentDate}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Documento</th>
            <th class="center">P1</th>
            <th class="center">P2</th>
            <th class="center">P3</th>
            <th class="center">P4</th>
            <th class="center">Promedio</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => {
            const p1Avg = average(student.grades?.p1)
            const p2Avg = average(student.grades?.p2)
            const p3Avg = average(student.grades?.p3)
            const p4Avg = average(student.grades?.p4)
            
            const allGrades = [p1Avg, p2Avg, p3Avg, p4Avg].filter(g => g !== null) as number[]
            const finalAverage = allGrades.length > 0 
              ? allGrades.reduce((acc, g) => acc + g, 0) / allGrades.length
              : null

            const getGradeClass = (grade: number | null) => {
              if (grade === null) return 'grade-none'
              if (grade >= 4.8) return 'grade-excellent'
              if (grade >= 4.0) return 'grade-good'
              if (grade >= 3.0) return 'grade-acceptable'
              return 'grade-poor'
            }

            const formatGrade = (grade: number | null) => {
              return grade !== null ? grade.toFixed(1) : '—'
            }

            return `
              <tr>
                <td>${student.fullName}</td>
                <td>${student.documentNumber}</td>
                <td class="center ${getGradeClass(p1Avg)}">${formatGrade(p1Avg)}</td>
                <td class="center ${getGradeClass(p2Avg)}">${formatGrade(p2Avg)}</td>
                <td class="center ${getGradeClass(p3Avg)}">${formatGrade(p3Avg)}</td>
                <td class="center ${getGradeClass(p4Avg)}">${formatGrade(p4Avg)}</td>
                <td class="center ${getGradeClass(finalAverage)}">${formatGrade(finalAverage)}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Total de estudiantes: ${students.length}</p>
        <p>Este documento fue generado automáticamente por el sistema académico</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          // Opcional: cerrar la ventana después de imprimir
          // setTimeout(() => window.close(), 100);
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}