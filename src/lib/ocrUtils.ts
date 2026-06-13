import Tesseract from "tesseract.js";
import type { Student, Teacher, AttendanceRecord } from "../types";

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ManualEntryData {
  type: "student" | "teacher" | "attendance";
  data: Student | Teacher | AttendanceRecord;
}

// ============ IMAGE TO TEXT OCR ============
export async function extractTextFromImage(imageFile: File): Promise<OCRResult> {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const image = e.target?.result as string;
          const result = await Tesseract.recognize(image, "eng");
          resolve({
            text: result.data.text,
            confidence: result.data.confidence,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsDataURL(imageFile);
    });
  } catch (err) {
    throw new Error(`OCR processing failed: ${(err as Error).message}`);
  }
}

// ============ PARSE ATTENDANCE FROM IMAGE ============
export async function parseAttendanceFromImage(
  imageFile: File,
  classInfo: { class: string; section: string }
): Promise<AttendanceRecord[]> {
  try {
    const ocrResult = await extractTextFromImage(imageFile);
    const lines = ocrResult.text.split("\n").filter((line) => line.trim());
    const records: AttendanceRecord[] = [];

    // Enhanced parsing logic - looks for patterns in the table
    // Patterns can be:
    // 1. "1001 | Arjun Singh | 10-A | PRESENT" 
    // 2. "1001 Arjun Singh PRESENT"
    // 3. "Roll: 1001, Name: Arjun, Status: P"
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Skip header rows and empty lines
      if (
        trimmed.toLowerCase().includes("roll") ||
        trimmed.toLowerCase().includes("name") ||
        trimmed.toLowerCase().includes("status") ||
        trimmed.length < 5
      ) {
        return;
      }

      // Pattern 1: Roll | Name | Status (pipe separated)
      const pipeMatch = trimmed.match(/^(\d+)\s*\|\s*([A-Za-z\s]+?)\s*\|\s*([A-Za-z\s\-]+?)\s*\|\s*(P|A|L|PRESENT|ABSENT|LATE)/i);
      if (pipeMatch) {
        const rollNumber = pipeMatch[1];
        const name = pipeMatch[2].trim();
        const statusStr = pipeMatch[4].toUpperCase();
        let status: "present" | "absent" | "late" = "present";

        if (statusStr === "A" || statusStr === "ABSENT") status = "absent";
        else if (statusStr === "L" || statusStr === "LATE") status = "late";

        records.push({
          id: `att${Date.now()}${index}`,
          studentId: `roll_${rollNumber}`,
          studentName: name,
          rollNumber,
          class: classInfo.class,
          section: classInfo.section,
          date: new Date().toISOString().split("T")[0],
          status,
          markedBy: "OCR Processing",
          markedAt: new Date().toISOString(),
        });
        return;
      }

      // Pattern 2: Roll Name Status (space separated)
      const spaceMatch = trimmed.match(/^(\d+)\s+([A-Za-z\s]+?)\s+(P|A|L|PRESENT|ABSENT|LATE)\s*$/i);
      if (spaceMatch) {
        const rollNumber = spaceMatch[1];
        const name = spaceMatch[2].trim();
        const statusStr = spaceMatch[3].toUpperCase();
        let status: "present" | "absent" | "late" = "present";

        if (statusStr === "A" || statusStr === "ABSENT") status = "absent";
        else if (statusStr === "L" || statusStr === "LATE") status = "late";

        records.push({
          id: `att${Date.now()}${index}`,
          studentId: `roll_${rollNumber}`,
          studentName: name,
          rollNumber,
          class: classInfo.class,
          section: classInfo.section,
          date: new Date().toISOString().split("T")[0],
          status,
          markedBy: "OCR Processing",
          markedAt: new Date().toISOString(),
        });
        return;
      }

      // Pattern 3: Roll Tab Name Tab Class Tab Status
      const tabMatch = trimmed.match(/(\d+)\s+([A-Za-z\s]+?)\s+(\d+-[A-Z])\s+(P|A|L|PRESENT|ABSENT|LATE)/i);
      if (tabMatch) {
        const rollNumber = tabMatch[1];
        const name = tabMatch[2].trim();
        const classStr = tabMatch[3];
        const statusStr = tabMatch[4].toUpperCase();
        let status: "present" | "absent" | "late" = "present";

        if (statusStr === "A" || statusStr === "ABSENT") status = "absent";
        else if (statusStr === "L" || statusStr === "LATE") status = "late";

        records.push({
          id: `att${Date.now()}${index}`,
          studentId: `roll_${rollNumber}`,
          studentName: name,
          rollNumber,
          class: classStr.split("-")[0],
          section: classStr.split("-")[1],
          date: new Date().toISOString().split("T")[0],
          status,
          markedBy: "OCR Processing",
          markedAt: new Date().toISOString(),
        });
        return;
      }
    });

    return records;
  } catch (err) {
    throw new Error(`Failed to parse attendance from image: ${(err as Error).message}`);
  }
}

// ============ CANVAS IMAGE CROPPING ============
export function cropImage(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): Blob {
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = width;
  croppedCanvas.height = height;

  const ctx = croppedCanvas.getContext("2d");
  if (ctx) {
    const imageData = canvas.getContext("2d")?.getImageData(x, y, width, height);
    if (imageData) {
      ctx.putImageData(imageData, 0, 0);
    }
  }

  return new Blob([croppedCanvas.toDataURL()], { type: "image/png" });
}

// ============ IMAGE PREVIEW ============
export function generateImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============ VALIDATE IMAGE ============
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Invalid image format. Please use JPG, PNG, WebP, or GIF." };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Image size must be less than 5MB." };
  }

  return { valid: true };
}
