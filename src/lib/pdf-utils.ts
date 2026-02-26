import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { useSettingsStore } from "@/features/settings/store";

export interface ProductLabel {
  name: string;
  sku: string;
  barcode: string;
  price?: number;
}

/**
 * Generates a PDF containing barcodes for the provided product labels.
 * Arranges labels in a 3-column grid on A4 size pages.
 */
export const generateBarcodesPDF = (
  labels: ProductLabel[],
  filename = "product-barcodes.pdf",
) => {
  const doc = new jsPDF();

  // Standard label size approximation (e.g. 63.5mm x 38.1mm - commonly 21 per sheet)
  const labelWidth = 64;
  const labelHeight = 34; // Reduced height slightly for better fit
  const marginX = 9;
  const marginY = 11;

  const cols = 3;
  const rows = 8; // 3 x 8 = 24 labels per page

  let col = 0;
  let row = 0;

  labels.forEach((label, index) => {
    // Check if we need a new page
    if (index > 0 && index % (cols * rows) === 0) {
      doc.addPage();
      col = 0;
      row = 0;
    }

    const x = marginX + col * labelWidth;
    const y = marginY + row * labelHeight;

    // Draw label border
    doc.setDrawColor(200);
    doc.rect(x, y, labelWidth, labelHeight);

    // Title (Product Name)
    doc.setFontSize(9);
    doc.text(
      label.name.substring(0, 35) + (label.name.length > 35 ? "..." : ""),
      x + 2,
      y + 5,
    );

    // SKU
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`SKU: ${label.sku}`, x + 2, y + 9);

    // Price
    if (label.price !== undefined) {
      const currencySymbol = useSettingsStore.getState().currencySymbol;
      doc.text(
        `${currencySymbol} ${label.price.toFixed(2)}`,
        x + labelWidth - 2,
        y + 9,
        {
          align: "right",
        },
      );
    }

    doc.setTextColor(0);

    // Generate Barcode Image
    const canvas = document.createElement("canvas");
    try {
      JsBarcode(canvas, label.barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 10,
        margin: 0,
      });
      const barcodeDataUrl = canvas.toDataURL("image/png");

      // Add Barcode Image to PDF
      // Adjust dimensions to fit nicely
      doc.addImage(barcodeDataUrl, "PNG", x + 2, y + 10, labelWidth - 4, 20);
    } catch (e) {
      console.error("Error generating barcode for", label.barcode, e);
      doc.setFontSize(8);
      doc.setTextColor(255, 0, 0);
      doc.text("Invalid Barcode", x + 2, y + 20);
      doc.setTextColor(0);
    }

    // Move to next position
    col++;
    if (col >= cols) {
      col = 0;
      row++;
    }
  });

  doc.save(filename);
};
