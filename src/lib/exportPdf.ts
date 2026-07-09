import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { AdminRow } from '@/stores/admin';

const STATUS_LABELS: Record<AdminRow['status'], string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

export function exportResultsToPdf(rows: AdminRow[], filterLabel: string): void {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('eTest SMP Labschool UNESA 3', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('English Placement Test — Results Report', 14, 22);
  doc.text(`Filter: ${filterLabel}`, 14, 27);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  const completed = rows.filter((r) => r.status === 'completed').length;
  const flagged = rows.filter((r) => r.flaggedForCheating).length;
  doc.text(`Students: ${rows.length}   Completed: ${completed}   Flagged: ${flagged}`, 14, 37);

  autoTable(doc, {
    startY: 42,
    head: [['No', 'Student', 'Session', 'Status', 'Score (/100)', 'Time Taken', 'Violations', 'Flag', 'Last Q']],
    body: rows.map((row, i) => [
      String(i + 1),
      row.name + (row.isTestAccount ? ' (test)' : ''),
      row.session,
      STATUS_LABELS[row.status],
      row.score === null ? '—' : String(row.score),
      formatDuration(row.durationTakenMs),
      String(row.violationCount),
      row.flaggedForCheating ? 'Flagged' : 'Clean',
      String(row.currentQuestionIndex + 1),
    ]),
    headStyles: { fillColor: [79, 134, 198] }, // primary
    styles: { fontSize: 9, cellPadding: 2.5 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7 && data.cell.raw === 'Flagged') {
        data.cell.styles.textColor = [179, 38, 30]; // danger
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const filename = `etest-results-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
