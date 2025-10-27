import { useState } from 'react';
import { FileText, Upload, X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractTextFromPDF, parseUltrasoundReport } from '../utils/pdfExtractor';

interface ReportFormProps {
  onReportCreated: () => void;
}

export function ReportForm({ onReportCreated }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'Male',
    examination_type: 'Abdomen',
    examination_date: new Date().toISOString().split('T')[0],
    indication: '',
    findings: '',
    impression: '',
    recommendations: '',
    referring_physician: '',
    radiologist_name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pdfData = null;
      let pdfFileName = null;
      let pdfFileSize = null;

      if (pdfFile) {
        const reader = new FileReader();
        pdfData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(pdfFile);
        });
        pdfFileName = pdfFile.name;
        pdfFileSize = pdfFile.size;
      }

      const { error } = await supabase.from('ultrasound_reports').insert([
        {
          ...formData,
          patient_age: parseInt(formData.patient_age),
          pdf_file_data: pdfData,
          pdf_file_name: pdfFileName,
          pdf_file_size: pdfFileSize,
        },
      ]);

      if (error) throw error;

      setFormData({
        patient_name: '',
        patient_age: '',
        patient_gender: 'Male',
        examination_type: 'Abdomen',
        examination_date: new Date().toISOString().split('T')[0],
        indication: '',
        findings: '',
        impression: '',
        recommendations: '',
        referring_physician: '',
        radiologist_name: '',
      });
      setPdfFile(null);

      onReportCreated();
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleExtractFromPdf = async () => {
    if (!pdfFile) return;

    setExtracting(true);
    try {
      const text = await extractTextFromPDF(pdfFile);
      const extractedData = parseUltrasoundReport(text);

      setFormData((prev) => ({
        ...prev,
        ...extractedData,
      }));

      alert('PDF data extracted successfully! Please review and correct any fields as needed.');
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      alert('Failed to extract data from PDF. Please fill in the form manually.');
    } finally {
      setExtracting(false);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">New Ultrasound Report</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Patient Age *
            </label>
            <input
              type="number"
              name="patient_age"
              value={formData.patient_age}
              onChange={handleChange}
              required
              min="0"
              max="150"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gender *
            </label>
            <select
              name="patient_gender"
              value={formData.patient_gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Examination Type *
            </label>
            <select
              name="examination_type"
              value={formData.examination_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Abdomen</option>
              <option>Pelvis</option>
              <option>Obstetric</option>
              <option>Thyroid</option>
              <option>Breast</option>
              <option>Musculoskeletal</option>
              <option>Vascular</option>
              <option>Cardiac</option>
              <option>Renal</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Examination Date *
            </label>
            <input
              type="date"
              name="examination_date"
              value={formData.examination_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Radiologist Name *
            </label>
            <input
              type="text"
              name="radiologist_name"
              value={formData.radiologist_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Referring Physician
            </label>
            <input
              type="text"
              name="referring_physician"
              value={formData.referring_physician}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Clinical Indication *
            </label>
            <textarea
              name="indication"
              value={formData.indication}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Findings *
            </label>
            <textarea
              name="findings"
              value={formData.findings}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Impression *
            </label>
            <textarea
              name="impression"
              value={formData.impression}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Recommendations
            </label>
            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              PDF Attachment (Optional)
            </label>
            {!pdfFile ? (
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Click to upload PDF (Max 10MB)
                  </span>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{pdfFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(pdfFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleExtractFromPdf}
                  disabled={extracting}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {extracting ? 'Extracting Data...' : 'Auto-Fill from PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Report...' : 'Create Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
