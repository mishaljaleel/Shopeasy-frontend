import React from 'react';
import { ShieldCheck, Database, Layers, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 text-slate-600 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <span>EasyShop Enterprise Marketplace</span>
          </div>
          <p className="text-slate-500 max-w-sm text-xs leading-relaxed">
            Final Semester MCA Project (MCSP-232) developed according to the approved synopsis for Indira Gandhi National Open University (IGNOU).
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-[11px] font-medium text-slate-600">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md">
              <Layers className="w-3 h-3 text-indigo-500" /> ASP.NET Core 9
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md">
              <Database className="w-3 h-3 text-blue-500" /> SQL Server (EF Core 9)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> JWT & BCrypt
            </span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-sm mb-3">Project Metadata</h4>
          <ul className="space-y-1.5 text-slate-500">
            <li><span className="font-medium text-slate-700">Course:</span> MCA (MCSP-232)</li>
            <li><span className="font-medium text-slate-700">Student:</span> Mishal Jaleel P</li>
            <li><span className="font-medium text-slate-700">Enrolment:</span> 2400990489</li>
            <li><span className="font-medium text-slate-700">Guide:</span> Bijeesh CP</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 text-sm mb-3">Architecture & Security</h4>
          <ul className="space-y-1.5 text-slate-500">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Clean Architecture / DDD</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 3NF Relational Integrity</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SignalR Real-Time Tracking</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Stock Audit Logs</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-100 text-center text-slate-400 text-[11px]">
        &copy; 2026 EasyShop Project. Designed & Engineered for IGNOU MCA Final Project Assessment.
      </div>
    </footer>
  );
};
