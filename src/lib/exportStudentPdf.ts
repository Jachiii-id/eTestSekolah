import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface StudentAnswerRow {
  number: number;
  text: string;
  studentAnswerText: string;
  correctText: string;
  isCorrect: boolean | null;
}

export function exportStudentDetailToPdf(studentName: string, rows: StudentAnswerRow[]): void {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('eTest SMP Labschool UNESA 3', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Answer Breakdown — ${studentName}`, 14, 22);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

  const correct = rows.filter((r) => r.isCorrect === true).length;
  const wrong = rows.filter((r) => r.isCorrect === false).length;
  const unanswered = rows.filter((r) => r.isCorrect === null).length;
  doc.text(`Correct: ${correct}   Incorrect: ${wrong}   Unanswered: ${unanswered}`, 14, 32);

  autoTable(doc, {
    startY: 37,
    head: [['No', 'Question', 'Your Answer', 'Correct Answer', 'Result']],
    body: rows.map((r) => [
      String(r.number),
      r.text,
      r.studentAnswerText,
      r.correctText,
      r.isCorrect === null ? 'Not answered' : r.isCorrect ? 'Correct' : 'False',
    ]),
    headStyles: { fillColor: [79, 134, 198] }, // primary
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      1: { cellWidth: 65 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Correct') {
          data.cell.styles.textColor = [26, 127, 78]; // success
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'False') {
          data.cell.styles.textColor = [179, 38, 30]; // danger
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const safeName = studentName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  doc.save(`etest-${safeName || 'student'}-answers.pdf`);
}
