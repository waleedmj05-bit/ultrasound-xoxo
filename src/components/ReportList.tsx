import { useState } from 'react';
import { Calendar, User, FileText, Trash2 } from 'lucide-react';
import { UltrasoundReport, supabase } from '../lib/supabase';

interface ReportListProps {
  reports: UltrasoundReport[];
  onReportDeleted: () => void;
}

export function ReportList({ reports, onReportDeleted }: ReportListProps) {
  const [selectedReport, setSelectedReport] = useState<UltrasoundReport | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from('ultrasound_reports').delete().eq('id', id);

      if (error) throw error;

      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      onReportDeleted();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No reports found. Create your first report above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recent Reports</h2>
        </div>
        <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                selectedReport?.id === report.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {report.patient_name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {report.patient_age}y, {report.patient_gender}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(report.examination_date)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {report.examination_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(report.id);
                  }}
                  disabled={deleting === report.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Report Details</h2>
        </div>
        {selectedReport ? (
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Patient Name
                  </p>
                  <p className="font-semibold text-slate-900">{selectedReport.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Age / Gender
                  </p>
                  <p className="font-semibold text-slate-900">
                    {selectedReport.patient_age} years, {selectedReport.patient_gender}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Examination Type
                  </p>
                  <p className="font-semibold text-slate-900">{selectedReport.examination_type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Examination Date
                  </p>
                  <p className="font-semibold text-slate-900">
                    {formatDate(selectedReport.examination_date)}
                  </p>
                </div>
                {selectedReport.referring_physician && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      Referring Physician
                    </p>
                    <p className="font-semibold text-slate-900">
                      {selectedReport.referring_physician}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Radiologist
                  </p>
                  <p className="font-semibold text-slate-900">{selectedReport.radiologist_name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                  Clinical Indication
                </h3>
                <p className="text-slate-700 leading-relaxed">{selectedReport.indication}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                  Findings
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.findings}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                  Impression
                </h3>
                <p className="text-slate-700 leading-relaxed">{selectedReport.impression}</p>
              </div>

              {selectedReport.recommendations && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                    Recommendations
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReport.recommendations}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Select a report to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
