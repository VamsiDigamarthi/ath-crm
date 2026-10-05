import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppTextarea } from '@/shared/components/AppTextarea';
import { Button } from '@/shared/components/Button';
import { AppEmptyState } from '@/shared/components/AppEmptyState';
import { useApplicationNotes } from '../hooks/useApplicationNotes';
import type { NoteTeam } from '../services/application-notes-service';

interface ApplicationNotesPanelProps {
  applicationId?: string;
}

const TEAM_OPTIONS: { value: NoteTeam; label: string }[] = [
  { value: 'ALL', label: 'Everyone on this return' },
  { value: 'DOCUMENTER', label: 'Documenter' },
  { value: 'PREPARER', label: 'Preparer' },
  { value: 'QA_REVIEWER', label: 'QA reviewer' },
  { value: 'SALES', label: 'Sales' },
  { value: 'FILING', label: 'Filing' },
];

const TEAM_LABEL: Record<string, string> = {
  ALL: 'Everyone',
  DOCUMENTER: 'Documenter',
  PREPARER: 'Preparer',
  QA_REVIEWER: 'QA reviewer',
  PREP_MANAGER: 'Prep manager',
  SALES: 'Sales',
  FILING: 'Filing',
  ADMIN: 'Admin',
};

const CONTEXT_LABEL: Record<string, string> = {
  MOVED_TO_PREP: 'Moved to tax prep',
  SUBMITTED_TO_QA: 'Submitted to QA',
  QA_REVISION: 'Revision requested',
  QA_SIGN_OFF: 'QA signed off',
  SALES_SEND_BACK: 'Sent back by sales',
  SENT_TO_FILING: 'Sent to filing',
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const ApplicationNotesPanel: React.FC<ApplicationNotesPanelProps> = ({ applicationId }) => {
  const { notes, isLoading, isSaving, message, setMessage, targetTeam, setTargetTeam, addNote } =
    useApplicationNotes(applicationId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Notes</h3>
        <p className="text-sm text-slate-500 mt-0.5">Shared with everyone who works on this return.</p>
      </div>

      <div className="px-5 py-4 border-b border-slate-100 space-y-3">
        <div className="w-full sm:w-64">
          <AppSelect
            label="For"
            options={TEAM_OPTIONS}
            value={targetTeam}
            onChange={(v) => setTargetTeam((v || 'ALL') as NoteTeam)}
          />
        </div>
        <AppTextarea
          value={message}
          onChange={setMessage}
          rows={3}
          maxLength={2000}
          showCount
          placeholder="Write a note..."
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={addNote}
            disabled={isSaving || message.trim().length < 2}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {isSaving ? 'Adding...' : 'Add note'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-2 animate-pulse">
          <div className="h-12 bg-slate-100 rounded" />
          <div className="h-12 bg-slate-100 rounded" />
        </div>
      ) : notes.length === 0 ? (
        <AppEmptyState icon={MessageSquare} title="No notes yet" description="Notes and hand-off messages will appear here." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {[...notes].reverse().map((n) => (
            <li key={n.id} className="px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-semibold text-slate-900">{n.authorName}</span>
                <span className="text-slate-400">{TEAM_LABEL[n.authorRole] || n.authorRole}</span>
                <span className="text-slate-300">→</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {TEAM_LABEL[n.targetTeam] || n.targetTeam}
                </span>
                {CONTEXT_LABEL[n.context] && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#15803D] font-medium">{CONTEXT_LABEL[n.context]}</span>
                )}
                <span className="text-slate-400 ml-auto">{formatTime(n.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 mt-1.5 whitespace-pre-wrap">{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
