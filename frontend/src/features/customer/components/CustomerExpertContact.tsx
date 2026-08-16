import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  Send, 
  ShieldCheck, 
  Award, 
  Clock, 
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import toast from 'react-hot-toast';

export const CustomerExpertContact: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'CLIENT' | 'AGENT'; text: string; time: string }>>([
    {
      sender: 'AGENT',
      text: 'Hello Naveen! I have initiated your TY 2025 W-2 tax preparation. Please let me know if you traded stocks on Robinhood this year.',
      time: 'Today 11:30 AM',
    },
    {
      sender: 'CLIENT',
      text: 'Hi Kavya, yes I have RSUs and 1099-B from Robinhood. I am uploading the statement to my vault now.',
      time: 'Today 11:45 AM',
    },
    {
      sender: 'AGENT',
      text: 'Awesome! Once uploaded, I will compute your preliminary refund draft and pass it to our CPA team for maximum deductions.',
      time: 'Today 11:48 AM',
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: 'CLIENT',
        text: inputMsg,
        time: 'Just now',
      },
    ]);
    setInputMsg('');
    toast.success('Message sent to Kavya! She will respond shortly.');
  };

  const handleRequestCallback = () => {
    toast.success('Callback requested! Kavya will call you within 15 minutes.');
  };

  return (
    <div className="space-y-6">
      {/* 1. Dedicated Tax Team Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile 1: Assigned Documenter Agent */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-[#16A34A] border border-emerald-500/30 flex items-center justify-center font-bold text-base">
                  KR
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">Kavya R</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                      Assigned Agent
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Documenter & Client Tax Intake Specialist
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email: <strong className="text-slate-800">kavya.r@taxcrm.com</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Average Response: <strong className="text-slate-800">&lt; 15 mins (9 AM - 7 PM CST)</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleRequestCallback}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex-1 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Request Phone Call</span>
            </Button>
          </div>
        </div>

        {/* Profile 2: Senior CPA Reviewer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-700 border border-indigo-500/30 flex items-center justify-center font-bold text-base">
                  RR
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">Ramesh Rao, CPA, EA</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      IRS Enrolled Agent
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Senior US Tax CPA & Filer Reviewer
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                <span>Credentials: <strong className="text-slate-800">12+ Years US Expat & NRI Tax Specialization</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>IRS PTIN & Circular 230 Licensed CPA</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Assigned to certify your Form 1040 return</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Direct Secure Messaging Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">Secure Direct Message Thread</h4>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Encrypted Channel
          </span>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'CLIENT' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.sender === 'CLIENT'
                    ? 'bg-[#16A34A] text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type your question for Kavya (e.g. deductions, stock sales, FBAR)..."
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-4 flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
