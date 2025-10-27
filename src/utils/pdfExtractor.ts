import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export function parseUltrasoundReport(text: string) {
  const result: Partial<{
    patient_name: string;
    patient_age: string;
    patient_gender: string;
    examination_type: string;
    examination_date: string;
    indication: string;
    findings: string;
    impression: string;
    recommendations: string;
    referring_physician: string;
    radiologist_name: string;
  }> = {};

  const lowerText = text.toLowerCase();

  const nameMatch = text.match(/(?:patient name|name)[:\s]*([A-Z][a-zA-Z\s]+?)(?=\n|patient|age|dob|date|\d)/i);
  if (nameMatch) result.patient_name = nameMatch[1].trim();

  const ageMatch = text.match(/(?:age|patient age)[:\s]*(\d{1,3})/i);
  if (ageMatch) result.patient_age = ageMatch[1];

  const genderMatch = text.match(/(?:gender|sex)[:\s]*(male|female|m|f)/i);
  if (genderMatch) {
    const g = genderMatch[1].toLowerCase();
    result.patient_gender = g === 'm' || g === 'male' ? 'Male' : 'Female';
  }

  const examTypes = ['abdomen', 'pelvis', 'obstetric', 'thyroid', 'breast', 'musculoskeletal', 'vascular', 'cardiac', 'renal'];
  for (const type of examTypes) {
    if (lowerText.includes(type)) {
      result.examination_type = type.charAt(0).toUpperCase() + type.slice(1);
      break;
    }
  }

  const dateMatch = text.match(/(?:date|exam date|examination date)[:\s]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
  if (dateMatch) {
    const dateParts = dateMatch[1].split(/[-/]/);
    if (dateParts.length === 3) {
      let year = dateParts[2];
      if (year.length === 2) year = '20' + year;
      const month = dateParts[0].padStart(2, '0');
      const day = dateParts[1].padStart(2, '0');
      result.examination_date = `${year}-${month}-${day}`;
    }
  }

  const indicationMatch = text.match(/(?:indication|clinical indication|history)[:\s]*([^\n]+(?:\n(?!findings|impression|recommendation)[^\n]+)*)/i);
  if (indicationMatch) result.indication = indicationMatch[1].trim();

  const findingsMatch = text.match(/(?:findings|examination findings)[:\s]*([^\n]+(?:\n(?!impression|recommendation|radiologist)[^\n]+)*)/i);
  if (findingsMatch) result.findings = findingsMatch[1].trim();

  const impressionMatch = text.match(/(?:impression|conclusion|diagnosis)[:\s]*([^\n]+(?:\n(?!recommendation|radiologist|referring)[^\n]+)*)/i);
  if (impressionMatch) result.impression = impressionMatch[1].trim();

  const recommendationsMatch = text.match(/(?:recommendations|recommendation|follow[- ]?up)[:\s]*([^\n]+(?:\n(?!radiologist|referring)[^\n]+)*)/i);
  if (recommendationsMatch) result.recommendations = recommendationsMatch[1].trim();

  const referringMatch = text.match(/(?:referring physician|referring doctor|referred by)[:\s]*([A-Z][a-zA-Z\s.]+?)(?=\n|radiologist|\d|$)/i);
  if (referringMatch) result.referring_physician = referringMatch[1].trim();

  const radiologistMatch = text.match(/(?:radiologist|performed by|interpreted by)[:\s]*([A-Z][a-zA-Z\s.]+?)(?=\n|\d|$)/i);
  if (radiologistMatch) result.radiologist_name = radiologistMatch[1].trim();

  return result;
}
