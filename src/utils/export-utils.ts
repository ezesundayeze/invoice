import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Ensure every <img> inside the element has finished loading/decoding before
// we rasterize it, otherwise html2canvas can capture a blank or clipped logo.
const waitForImages = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );
};

// html2canvas can mis-size images set with `auto`/`max-*` and clip them. Pin
// each image to its currently rendered pixel size so the capture is exact.
const freezeImageSizes = (element: HTMLElement): void => {
  element.querySelectorAll("img").forEach((img) => {
    if (img.offsetWidth && img.offsetHeight) {
      img.style.width = `${img.offsetWidth}px`;
      img.style.height = `${img.offsetHeight}px`;
    }
  });
};

export const exportToPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    await waitForImages(element);
    freezeImageSizes(element);

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add new pages if the content exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF');
  }
};
