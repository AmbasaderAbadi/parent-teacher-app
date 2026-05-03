import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Export quiz as PDF
export const exportQuizToPDF = (quiz, title = "Quiz") => {
  const doc = new jsPDF();
  const questions = quiz.questions || [];

  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(`Subject: ${quiz.subject || "—"}`, 14, 32);
  doc.text(`Grade: ${quiz.grade || "—"}`, 14, 40);
  if (quiz.topic) doc.text(`Topic: ${quiz.topic}`, 14, 48);
  doc.text(`Difficulty: ${quiz.difficulty || "—"}`, 14, 56);

  const tableData = questions.map((q, idx) => [
    `${idx + 1}. ${q.text}`,
    q.options?.join(" | ") || "",
    q.correct !== undefined
      ? `Answer: ${q.options ? q.options[q.correct] : q.correct}`
      : "",
  ]);

  autoTable(doc, {
    startY: 66,
    head: [["Question", "Options", "Correct Answer"]],
    body: tableData,
    styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
};

// Export material metadata as PDF
export const exportMaterialToPDF = (material, title = "Material Details") => {
  const doc = new jsPDF();
  let y = 22;

  doc.setFontSize(18);
  doc.text(title, 14, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Title: ${material.title || "—"}`, 14, y);
  y += 8;
  doc.text(`Subject: ${material.subject || "—"}`, 14, y);
  y += 8;
  doc.text(`Grade: ${material.grade || "—"}`, 14, y);
  y += 8;
  if (material.section) {
    doc.text(`Section: ${material.section}`, 14, y);
    y += 8;
  }
  if (material.className) {
    doc.text(`Class: ${material.className}`, 14, y);
    y += 8;
  }
  if (material.description) {
    doc.text("Description:", 14, y);
    y += 6;
    const splitDesc = doc.splitTextToSize(material.description, 180);
    doc.text(splitDesc, 14, y);
    y += splitDesc.length * 6 + 4;
  }
  doc.text(`Uploaded by: ${material.uploadedBy || "—"}`, 14, y);
  y += 8;
  doc.text(`Date: ${material.date || "—"}`, 14, y);
  y += 8;
  if (material.fileUrl) {
    const urlText =
      material.fileUrl.length > 70
        ? material.fileUrl.substring(0, 70) + "…"
        : material.fileUrl;
    doc.text(`File URL: ${urlText}`, 14, y);
  }

  doc.save(
    `${material.title?.replace(/[^a-z0-9]/gi, "_") || "material"}_details.pdf`,
  );
};
