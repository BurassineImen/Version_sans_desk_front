import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateLabelPDF = async (labelElement) => {
  const canvas = await html2canvas(labelElement);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  pdf.addImage(imgData, 'PNG', 10, 10, 50, 30);
  return pdf;
};

export const generateBatchPDF = async (labelElements) => {
  const pdf = new jsPDF();
  
  for (let i = 0; i < labelElements.length; i++) {
    if (i > 0) pdf.addPage();
    
    const canvas = await html2canvas(labelElements[i]);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 50, 30);
  }
  
  return pdf;
};