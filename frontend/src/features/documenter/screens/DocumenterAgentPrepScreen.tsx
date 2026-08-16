import React, { useMemo } from 'react';
import { useDocumenterWorkspace } from '../hooks/useDocumenterWorkspace';
import { AppCopyButton } from '@/shared/components/AppCopyButton';
import { Button } from '@/shared/components/Button';
import { 
  FileCheck2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Send,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PrepItem {
  id: string;
  taxpayerName: string;
  phone: string;
  email: string;
  visaType: string;
  organizerProgress: number; // 0 to 100%
  completedModules: string;
  docsUploaded: number;
  totalExpectedDocs: number;
  estRefund: string;
  stageStatus: 'ORGANIZER_IN_PROGRESS' | 'DOCS_PENDING' | 'READY_FOR_SALES';
}

export const DocumenterAgentPrepScreen: React.FC = () => {
  const { isLoading, refreshData } = useDocumenterWorkspace();

  const prepList: PrepItem[] = useMemo(() => [
    {
      id: 'prep-1',
      taxpayerName: 'Siddharth Varma',
      phone: '+1 (555) 789-0123',
      email: 'siddharth.varma@gmail.com',
      visaType: 'H-1B',
      organizerProgress: 100,
      completedModules: '9 of 9 Modules Completed',
      docsUploaded: 4,
      totalExpectedDocs: 4,
      estRefund: '$2,840 Fed • $680 State',
      stageStatus: 'READY_FOR_SALES',
    },
    {
      id: 'prep-2',
      taxpayerName: 'Divya Reddy',
      phone: '+1 (555) 890-1234',
      email: 'divya.reddy@tech.com',
      visaType: 'F-1 OPT',
      organizerProgress: 78,
      completedModules: '7 of 9 Modules Completed',
      docsUploaded: 2,
      totalExpectedDocs: 3,
      estRefund: '$1,420 Fed • Non-Resident',
      stageStatus: 'DOCS_PENDING',
    },
    {
      id: 'prep-3',
      taxpayerName: 'Karthik Rao',
      phone: '+1 (555) 901-2345',
      email: 'karthik.rao@cloud.io',
      visaType: 'L-1',
      organizerProgress: 55,
      completedModules: '5 of 9 Modules Completed',
      docsUploaded: 1,
      totalExpectedDocs: 4,
      estRefund: 'Pending W-2 upload',
      stageStatus: 'ORGANIZER_IN_PROGRESS',
    },
    {
      id: 'prep-4',
      taxpayerName: 'Sneha Patel',
      phone: '+1 (555) 012-3456',
      email: 'sneha.patel@global.com',
      visaType: 'H-1B',
      organizerProgress: 100,
      completedModules: '9 of 9 Modules Completed',
      docsUploaded: 5,
      totalExpectedDocs: 5,
      estRefund: '$3,150 Fed • $890 State',
      stageStatus: 'READY_FOR_SALES',
    },
  ], []);

  const handleSendToSales = (taxpayerName: string) => {
    toast.success(`Draft computation for ${taxpayerName} submitted to Sales Pitch Queue!`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Active W-2 Tax Preparation Intakes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Review uploaded W-2/1099 tax forms, verify 9-module organizer completions, compute tax estimates, and move to Sales.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">4 Clients in Prep</div>
            <div className="text-xs text-slate-500 font-medium">Currently reviewing files</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">2 Ready for Sales</div>
            <div className="text-xs text-slate-500 font-medium">100% complete organizer drafts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">12 Documents Verified</div>
            <div className="text-xs text-slate-500 font-medium">W-2, 1099-INT, 1098 Mortgage</div>
          </div>
        </div>
      </div>

      {/* 3. Prep Intakes Cards List */}
      <div className="space-y-4">
        {prepList.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border transition-all bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs ${
              item.stageStatus === 'READY_FOR_SALES'
                ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-base font-bold text-slate-900">{item.taxpayerName}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.visaType}
                </span>
                {item.stageStatus === 'READY_FOR_SALES' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Ready for Sales Handoff
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Intake In-Progress
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                <span>Phone: <strong className="text-slate-900">{item.phone}</strong></span>
                <AppCopyButton text={item.phone} size="sm" />
                <span className="text-slate-300">•</span>
                <span>Email: <strong className="text-slate-900">{item.email}</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium">9-Module Organizer:</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center justify-between">
                    <span>{item.completedModules}</span>
                    <span className="text-[#16A34A]">{item.organizerProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div className="bg-[#16A34A] h-full rounded-full" style={{ width: `${item.organizerProgress}%` }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="text-[11px] text-slate-500 font-medium">Uploaded Documents:</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {item.docsUploaded} of {item.totalExpectedDocs} Verified
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">W-2, 1099, ID Attachments</div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                  <div className="text-[11px] text-emerald-800 font-medium">Estimated Draft Refund:</div>
                  <div className="font-bold text-emerald-950 mt-0.5 text-xs sm:text-sm">
                    {item.estRefund}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:items-end justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Forms</span>
                </Button>

                {item.stageStatus === 'READY_FOR_SALES' && (
                  <Button
                    size="sm"
                    onClick={() => handleSendToSales(item.taxpayerName)}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Sales</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
