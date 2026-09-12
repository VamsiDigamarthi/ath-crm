import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Quote,
  Undo,
  Redo,
  Sparkles,
  Eye,
  Edit3,
  Minus,
  RemoveFormatting,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmailTemplateRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

const TEMPLATE_VARIABLES = [
  { tag: '{{taxpayer_name}}', label: 'Taxpayer Name', desc: 'Client full legal name' },
  { tag: '{{tax_year}}', label: 'Tax Year', desc: 'Filing tax year (e.g. 2025)' },
  { tag: '{{visa_type}}', label: 'Visa Type', desc: 'F-1 / H-1B / L-1 / OPT' },
  { tag: '{{assigned_agent}}', label: 'Assigned Specialist', desc: 'Specialist in charge' },
  { tag: '{{assigned_agent_email}}', label: 'Agent Email', desc: 'Contact email' },
  { tag: '{{fed_refund}}', label: 'Fed Refund', desc: 'Federal refund amount' },
  { tag: '{{state_refund}}', label: 'State Refund', desc: 'State refund amount' },
  { tag: '{{total_refund}}', label: 'Total Refund', desc: 'Combined net refund' },
  { tag: '{{filing_status}}', label: 'Stage Status', desc: 'Current return stage' },
  { tag: '{{company_name}}', label: 'Company Name', desc: 'ATH Tax Advisory' },
  { tag: '{{portal_link}}', label: 'Portal Link', desc: 'Secure client portal URL' },
];

export const EmailTemplateRichEditor: React.FC<EmailTemplateRichEditorProps> = ({
  value,
  onChange,
  label = 'Email Body Content',
  placeholder = 'Compose email template body here. Use variables from the bar below...',
  error,
  helperText,
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef<boolean>(false);
  const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Sync incoming value to editor DOM
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  // Track active formatting at cursor
  const updateActiveFormats = useCallback(() => {
    if (viewMode !== 'EDIT') return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignore in unsupported environments
    }
  }, [viewMode]);

  // Handle content change from contentEditable div
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const currentHtml = editorRef.current.innerHTML;
    onChange(currentHtml);
    updateActiveFormats();
  };

  // Execute standard formatting commands
  const executeCommand = (command: string, arg?: string) => {
    if (viewMode !== 'EDIT') return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  // Insert Link Prompt - Supports selected text or standalone link with blue underline
  const handleInsertLink = () => {
    if (viewMode !== 'EDIT') return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    let selectedText = '';
    if (sel && sel.rangeCount > 0) {
      selectedText = sel.toString().trim();
    }

    const rawUrl = prompt(
      'Enter web link URL (e.g. https://taxcrm.com or mailto:support@taxcrm.com):',
      'https://'
    );
    if (!rawUrl || rawUrl.trim() === '' || rawUrl.trim() === 'https://') return;

    let validUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(validUrl) && !/^mailto:/i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    if (selectedText) {
      document.execCommand('createLink', false, validUrl);
      const links = editorRef.current?.querySelectorAll('a');
      links?.forEach((a) => {
        if (!a.getAttribute('target')) {
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
        }
      });
    } else {
      const linkText = prompt('Enter link text to display:', validUrl) || validUrl;
      const linkHtml = `<a href="${validUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a> `;
      document.execCommand('insertHTML', false, linkHtml);
    }
    handleEditorInput();
  };

  // Insert Variable tag cleanly at cursor as plain text
  const handleInsertVariable = (variableTag: string) => {
    if (viewMode === 'PREVIEW') {
      setViewMode('EDIT');
    }

    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      executeCommand('insertText', variableTag + ' ');
      return;
    }

    const range = sel.getRangeAt(0);
    range.deleteContents();

    // Insert as standard text node so subsequent typing stays normal dark text
    const textNode = document.createTextNode(variableTag + ' ');
    range.insertNode(textNode);

    // Move cursor after the inserted variable text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(range);

    handleEditorInput();
  };

  // Helper to simulate variables for preview mode
  const getSimulatedPreviewHtml = (rawHtml: string) => {
    if (!rawHtml || rawHtml.trim() === '') {
      return '<p class="text-slate-400 italic">No content to preview yet. Switch back to Edit mode to write your email.</p>';
    }

    return rawHtml
      .replace(/\{\{taxpayer_name\}\}/g, '<strong>Alex Chen</strong>')
      .replace(/\{\{tax_year\}\}/g, '<strong>2025</strong>')
      .replace(/\{\{visa_type\}\}/g, '<strong>F-1 OPT</strong>')
      .replace(/\{\{assigned_agent\}\}/g, '<strong>Sarah Jenkins (CPA)</strong>')
      .replace(/\{\{assigned_agent_email\}\}/g, '<strong>sarah.j@taxcrm.com</strong>')
      .replace(/\{\{fed_refund\}\}/g, '<strong style="color: #16A34A;">$1,845.00</strong>')
      .replace(/\{\{state_refund\}\}/g, '<strong style="color: #16A34A;">$420.00</strong>')
      .replace(/\{\{total_refund\}\}/g, '<strong style="color: #16A34A;">$2,265.00</strong>')
      .replace(/\{\{filing_status\}\}/g, '<strong>QA_APPROVED</strong>')
      .replace(/\{\{company_name\}\}/g, '<strong>ATH Tax Advisory</strong>')
      .replace(
        /\{\{portal_link\}\}/g,
        '<a href="https://taxcrm.com/customer/organizer" target="_blank" rel="noopener noreferrer">https://taxcrm.com/customer/organizer</a>'
      );
  };

  return (
    <div className={cn('space-y-1.5 font-sans', className)}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-rose-500 font-bold">*</span>
        </label>

        {/* Edit Mode vs Live Preview Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('EDIT')}
            className={cn(
              'px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              viewMode === 'EDIT'
                ? 'bg-white text-[#16A34A] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('PREVIEW')}
            className={cn(
              'px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer',
              viewMode === 'PREVIEW'
                ? 'bg-white text-[#16A34A] shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div
        className={cn(
          'rounded-xl border bg-white overflow-hidden transition-all shadow-2xs',
          error
            ? 'border-rose-300 ring-1 ring-rose-200'
            : 'border-slate-200 focus-within:border-[#16A34A] focus-within:ring-1 focus-within:ring-[#16A34A]/20'
        )}
      >
        {/* Formatting Toolbar - Only visible in EDIT mode */}
        {viewMode === 'EDIT' && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 select-none">
            {/* History */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => executeCommand('undo')}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('redo')}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Headings & Text Blocks */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h1>')}
                title="Heading 1"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h2>')}
                title="Heading 2"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h3>')}
                title="Heading 3"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Styles */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                title="Bold (Ctrl+B)"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.bold
                    ? 'bg-emerald-100 text-[#16A34A] font-bold'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                title="Italic (Ctrl+I)"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.italic
                    ? 'bg-emerald-100 text-[#16A34A] font-bold'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                title="Underline (Ctrl+U)"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.underline
                    ? 'bg-emerald-100 text-[#16A34A] font-bold'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('strikeThrough')}
                title="Strikethrough"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.strikeThrough
                    ? 'bg-emerald-100 text-[#16A34A] font-bold'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => executeCommand('justifyLeft')}
                title="Align Left"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.justifyLeft
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyCenter')}
                title="Align Center"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.justifyCenter
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyRight')}
                title="Align Right"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.justifyRight
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lists & Quotes */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                title="Bullet List"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.insertUnorderedList
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertOrderedList')}
                title="Numbered List"
                className={cn(
                  'p-1.5 rounded transition-colors cursor-pointer',
                  activeFormats.insertOrderedList
                    ? 'bg-emerald-100 text-[#16A34A]'
                    : 'hover:bg-slate-200 text-slate-600'
                )}
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<blockquote>')}
                title="Quote Block"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Special Links & Elements */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleInsertLink}
                title="Insert Web Link"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertHorizontalRule')}
                title="Horizontal Divider"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('removeFormat')}
                title="Clear Formatting"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area: Editor Mode vs Live Preview Mode */}
        {viewMode === 'EDIT' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            data-placeholder={placeholder}
            className="min-h-[220px] max-h-[360px] overflow-y-auto p-4 text-xs sm:text-sm text-slate-900 leading-relaxed outline-hidden focus:outline-hidden rich-editor-content empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none font-sans"
            style={{ minHeight: '220px', color: '#0f172a' }}
          />
        ) : (
          <div className="p-4 min-h-[220px] max-h-[360px] overflow-y-auto bg-slate-50/50">
            <div className="mb-2 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Simulated Email Preview (How client sees it)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Sample Client: Alex Chen (TY 2025)
              </span>
            </div>
            <div
              className="rich-editor-content text-xs sm:text-sm text-slate-900 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: getSimulatedPreviewHtml(value || '') }}
            />
          </div>
        )}

        {/* Template Variables Helper Tray */}
        <div className="bg-slate-50 border-t border-slate-200 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Click to Insert Dynamic Variable Tag into Body:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {TEMPLATE_VARIABLES.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => handleInsertVariable(v.tag)}
                title={v.desc}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <span className="font-mono text-[10px] text-emerald-600">{v.tag}</span>
                <span className="text-slate-400 text-[10px]">({v.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error or Helper text */}
      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
