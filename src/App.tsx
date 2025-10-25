import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { ReportForm } from './components/ReportForm';
import { ReportList } from './components/ReportList';
import { supabase, UltrasoundReport } from './lib/supabase';

function App() {
  const [reports, setReports] = useState<UltrasoundReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ultrasound_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ultrasound Report System</h1>
              <p className="text-sm text-slate-600">Quick summary and management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ReportForm onReportCreated={fetchReports} />

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-500 mt-4">Loading reports...</p>
            </div>
          ) : (
            <ReportList reports={reports} onReportDeleted={fetchReports} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
