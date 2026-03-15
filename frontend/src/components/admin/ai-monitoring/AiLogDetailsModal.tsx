"use client";

import type { AdminAiLog } from "@/src/types/admin-ai-monitoring.types";
import { X, Calendar, User, Info, Clock, Box, ShieldAlert } from "lucide-react";

interface AiLogDetailsModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  log: AdminAiLog | null;
  onClose: () => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatDate = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return DATE_FORMATTER.format(date);
};

const PanelField = ({ label, value, icon: Icon }: { label: string; value?: string | null; icon: React.ElementType }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-700">
      {value && value.trim().length > 0 ? value : "-"}
    </div>
  </div>
);

export default function AiLogDetailsModal({
  isOpen,
  isLoading = false,
  log,
  onClose,
}: AiLogDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div 
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-white px-5 py-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Tracking IA
              </span>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(log?.createdAt)}
              </p>
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {log?.actionType || "Chargement..."}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : !log ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-xl dashed border-2 border-slate-200 bg-slate-50 text-slate-500">
              <ShieldAlert className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Impossible de charger les détails.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Metadata */}
              <div className="grid gap-4 sm:grid-cols-2">
                <PanelField label="Utilisateur" value={log.user?.fullName || log.userId} icon={User} />
                <PanelField label="Fonctionnalité" value={log.featureType} icon={Box} />
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Statut</p>
                  </div>
                  <div className={`inline-flex items-center h-9 px-3 rounded-xl border text-sm font-bold ${
                    log.status === "success" 
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}>
                    {log.status === "success" ? "Succès" : "Échec"}
                  </div>
                </div>

                <PanelField
                  label="Latence IA"
                  value={typeof log.responseTimeMs === "number" ? `${Math.round(log.responseTimeMs)} ms` : undefined}
                  icon={Clock}
                />
                <PanelField label="Modèle Utilisé" value={log.modelName} icon={Info} />
                <PanelField label="ID Entité" value={log.relatedEntityId} icon={Box} />
              </div>

              {/* Data payload segments */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Données envoyées (Prompt / Input)
                </p>
                <div className="relative group">
                  <pre className="max-h-56 overflow-auto rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 text-xs leading-relaxed text-indigo-950 font-mono whitespace-pre-wrap custom-scrollbar">
                    {log.inputSummary || "-"}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Réponse reçue (Output)
                </p>
                <div className="relative group">
                  <pre className="max-h-56 overflow-auto rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 text-xs leading-relaxed text-emerald-950 font-mono whitespace-pre-wrap custom-scrollbar">
                    {log.responseSummary || "-"}
                  </pre>
                </div>
              </div>

              {log.errorMessage && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Message d'erreur
                  </p>
                  <pre className="max-h-32 overflow-auto rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800 font-mono whitespace-pre-wrap custom-scrollbar">
                    {log.errorMessage}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
