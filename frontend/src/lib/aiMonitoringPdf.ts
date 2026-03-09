import { jsPDF } from "jspdf";
import type {
  AdminAiLog,
  AdminAiMonitoringFilters,
  AdminAiUsageByUserItem,
} from "@/src/types/admin-ai-monitoring.types";

type PdfContext = {
  doc: jsPDF;
  y: number;
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  contentTop: number;
  title: string;
  generatedAt: string;
};

type AiLogsPdfPayload = {
  title: string;
  subtitle?: string;
  fileName: string;
  filters: AdminAiMonitoringFilters;
  logs: AdminAiLog[];
  generatedAt?: string;
};

type AiUsageByUserPdfPayload = {
  title: string;
  subtitle?: string;
  fileName: string;
  filters: AdminAiMonitoringFilters;
  items: AdminAiUsageByUserItem[];
  generatedAt?: string;
};

const TITLE_COLOR: [number, number, number] = [15, 23, 42];
const MUTED_COLOR: [number, number, number] = [100, 116, 139];
const ACCENT_COLOR: [number, number, number] = [8, 145, 178];
const BORDER_COLOR: [number, number, number] = [226, 232, 240];

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (value: string | undefined, maxLength: number): string => {
  if (!value) {
    return "-";
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "-";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
};

const drawHeader = (ctx: PdfContext) => {
  const { doc, width, marginLeft, marginRight, title, generatedAt } = ctx;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, 16, "F");
  doc.setDrawColor(...BORDER_COLOR);
  doc.line(0, 16, width, 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...TITLE_COLOR);
  doc.text(title, marginLeft, 10.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED_COLOR);
  doc.text(`Generated: ${generatedAt}`, width - marginRight, 10.5, { align: "right" });
};

const addPage = (ctx: PdfContext) => {
  ctx.doc.addPage();
  drawHeader(ctx);
  ctx.y = ctx.contentTop;
};

const ensureSpace = (ctx: PdfContext, required: number) => {
  if (ctx.y + required > ctx.height - ctx.marginBottom) {
    addPage(ctx);
  }
};

const addWrappedText = (
  ctx: PdfContext,
  text: string,
  options: {
    x?: number;
    maxWidth?: number;
    fontSize?: number;
    fontStyle?: "normal" | "bold";
    color?: [number, number, number];
    lineHeight?: number;
  } = {},
) => {
  const x = options.x ?? ctx.marginLeft;
  const maxWidth = options.maxWidth ?? ctx.width - ctx.marginLeft - ctx.marginRight;
  const fontSize = options.fontSize ?? 10;
  const fontStyle = options.fontStyle ?? "normal";
  const color = options.color ?? TITLE_COLOR;
  const lineHeight = options.lineHeight ?? 5;
  const lines = ctx.doc.splitTextToSize(text, maxWidth) as string[];

  ctx.doc.setFont("helvetica", fontStyle);
  ctx.doc.setFontSize(fontSize);
  ctx.doc.setTextColor(...color);

  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    ctx.doc.text(line, x, ctx.y);
    ctx.y += lineHeight;
  }
};

const addSectionTitle = (ctx: PdfContext, title: string) => {
  ensureSpace(ctx, 10);
  ctx.doc.setFillColor(241, 245, 249);
  ctx.doc.roundedRect(
    ctx.marginLeft,
    ctx.y - 4.5,
    ctx.width - ctx.marginLeft - ctx.marginRight,
    9,
    2,
    2,
    "F",
  );

  addWrappedText(ctx, title, {
    x: ctx.marginLeft + 2.5,
    maxWidth: ctx.width - ctx.marginLeft - ctx.marginRight - 5,
    fontSize: 11.5,
    fontStyle: "bold",
    color: ACCENT_COLOR,
    lineHeight: 5.6,
  });
  ctx.y += 1.2;
};

const formatFilters = (filters: AdminAiMonitoringFilters): string[] => {
  const lines: string[] = [];
  const from = filters.dateFrom?.trim();
  const to = filters.dateTo?.trim();
  const feature = filters.featureType || "All features";
  const status = filters.status || "All statuses";
  const actionType = filters.actionType?.trim() || "All actions";
  const userId = filters.userId?.trim() || "-";
  const userSearch = filters.userSearch?.trim() || "-";

  lines.push(`Date range: ${from || "-"} -> ${to || "-"}`);
  lines.push(`Feature: ${feature}`);
  lines.push(`Status: ${status}`);
  lines.push(`Action type: ${actionType}`);
  lines.push(`User ID filter: ${userId}`);
  lines.push(`User search filter: ${userSearch}`);

  return lines;
};

const addPageNumbers = (ctx: PdfContext) => {
  const pages = ctx.doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    ctx.doc.setPage(page);
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...MUTED_COLOR);
    ctx.doc.text(`${page} / ${pages}`, ctx.width - ctx.marginRight, ctx.height - 6.5, {
      align: "right",
    });
  }
};

export const generateAiMonitoringLogsPdf = (payload: AiLogsPdfPayload): void => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const generatedAt = formatDateTime(payload.generatedAt || new Date().toISOString());

  const ctx: PdfContext = {
    doc,
    y: 26,
    width,
    height,
    marginLeft: 14,
    marginRight: 14,
    marginBottom: 14,
    contentTop: 24,
    title: payload.title,
    generatedAt,
  };

  drawHeader(ctx);

  addWrappedText(ctx, payload.title, {
    fontSize: 17,
    fontStyle: "bold",
    color: TITLE_COLOR,
    lineHeight: 7,
  });

  if (payload.subtitle) {
    addWrappedText(ctx, payload.subtitle, {
      fontSize: 10.5,
      color: MUTED_COLOR,
      lineHeight: 5,
    });
  }

  ctx.y += 1.5;
  addWrappedText(ctx, `Total logs: ${payload.logs.length}`, {
    fontSize: 10,
    fontStyle: "bold",
    color: TITLE_COLOR,
  });
  ctx.y += 2;

  addSectionTitle(ctx, "Applied Filters");
  const filterLines = formatFilters(payload.filters);
  for (const line of filterLines) {
    addWrappedText(ctx, line, { fontSize: 9.5, color: MUTED_COLOR, lineHeight: 4.7 });
  }

  ctx.y += 2;
  addSectionTitle(ctx, "Logs");

  if (payload.logs.length === 0) {
    addWrappedText(ctx, "No logs found for selected filters.", {
      color: MUTED_COLOR,
      fontSize: 10,
    });
  } else {
    payload.logs.forEach((log, index) => {
      const userLabel = log.user?.fullName || log.user?.email || log.userId || "Unknown user";
      const userEmail = log.user?.email || "-";
      const responseTime =
        typeof log.responseTimeMs === "number" ? `${Math.round(log.responseTimeMs)} ms` : "-";

      addWrappedText(ctx, `${index + 1}. ${formatDateTime(log.createdAt)} - ${userLabel}`, {
        fontStyle: "bold",
        fontSize: 10,
      });
      addWrappedText(ctx, `Email: ${userEmail}`, { fontSize: 9.2, color: MUTED_COLOR });
      addWrappedText(
        ctx,
        `Feature: ${log.featureType.toUpperCase()} | Action: ${log.actionType} | Status: ${log.status.toUpperCase()}`,
        { fontSize: 9.2 },
      );
      addWrappedText(
        ctx,
        `Response time: ${responseTime} | Model: ${log.modelName || "-"} | Related entity: ${log.relatedEntityId || "-"}`,
        { fontSize: 9.2 },
      );
      addWrappedText(ctx, `Input: ${truncateText(log.inputSummary, 260)}`, {
        fontSize: 9.2,
        color: MUTED_COLOR,
      });
      addWrappedText(ctx, `Response: ${truncateText(log.responseSummary, 260)}`, {
        fontSize: 9.2,
        color: MUTED_COLOR,
      });
      if (log.errorMessage) {
        addWrappedText(ctx, `Error: ${truncateText(log.errorMessage, 220)}`, {
          fontSize: 9.2,
          color: [190, 24, 93],
        });
      }

      ensureSpace(ctx, 4);
      ctx.doc.setDrawColor(...BORDER_COLOR);
      ctx.doc.line(ctx.marginLeft, ctx.y, ctx.width - ctx.marginRight, ctx.y);
      ctx.y += 4;
    });
  }

  addPageNumbers(ctx);
  doc.save(payload.fileName);
};

export const generateAiMonitoringUsageByUserPdf = (
  payload: AiUsageByUserPdfPayload,
): void => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const generatedAt = formatDateTime(payload.generatedAt || new Date().toISOString());

  const ctx: PdfContext = {
    doc,
    y: 26,
    width,
    height,
    marginLeft: 14,
    marginRight: 14,
    marginBottom: 14,
    contentTop: 24,
    title: payload.title,
    generatedAt,
  };

  drawHeader(ctx);

  addWrappedText(ctx, payload.title, {
    fontSize: 17,
    fontStyle: "bold",
    color: TITLE_COLOR,
    lineHeight: 7,
  });

  if (payload.subtitle) {
    addWrappedText(ctx, payload.subtitle, {
      fontSize: 10.5,
      color: MUTED_COLOR,
      lineHeight: 5,
    });
  }

  const totalRequests = payload.items.reduce((sum, item) => sum + item.totalRequests, 0);
  const totalSuccess = payload.items.reduce((sum, item) => sum + item.successfulRequests, 0);
  const totalFailed = payload.items.reduce((sum, item) => sum + item.failedRequests, 0);
  const averageResponseTime =
    payload.items.length > 0
      ? Math.round(
          payload.items.reduce((sum, item) => sum + item.averageResponseTimeMs, 0) /
            payload.items.length,
        )
      : 0;

  ctx.y += 1.5;
  addWrappedText(
    ctx,
    `Users: ${payload.items.length} | Requests: ${totalRequests} | Success: ${totalSuccess} | Failed: ${totalFailed} | Avg response: ${averageResponseTime} ms`,
    {
      fontSize: 10,
      fontStyle: "bold",
      color: TITLE_COLOR,
    },
  );

  ctx.y += 2;
  addSectionTitle(ctx, "Applied Filters");
  const filterLines = formatFilters(payload.filters);
  for (const line of filterLines) {
    addWrappedText(ctx, line, { fontSize: 9.5, color: MUTED_COLOR, lineHeight: 4.7 });
  }

  ctx.y += 2;
  addSectionTitle(ctx, "Usage by User");

  if (payload.items.length === 0) {
    addWrappedText(ctx, "No usage data for selected filters.", {
      color: MUTED_COLOR,
      fontSize: 10,
    });
  } else {
    payload.items.forEach((item, index) => {
      const userName = item.user?.fullName || item.user?.email || item.userId || "Unknown user";
      const email = item.user?.email || "-";
      const successRate = Number.isFinite(item.successRate) ? `${item.successRate}%` : "-";
      const lastUsed = formatDateTime(item.lastUsedAt);

      addWrappedText(ctx, `${index + 1}. ${userName}`, {
        fontStyle: "bold",
        fontSize: 10,
      });
      addWrappedText(ctx, `Email: ${email} | User ID: ${item.userId || "-"}`, {
        fontSize: 9.2,
        color: MUTED_COLOR,
      });
      addWrappedText(
        ctx,
        `Requests: ${item.totalRequests} | Success: ${item.successfulRequests} | Failed: ${item.failedRequests} | Success rate: ${successRate}`,
        { fontSize: 9.2 },
      );
      addWrappedText(
        ctx,
        `Average response: ${item.averageResponseTimeMs} ms | Last used: ${lastUsed}`,
        { fontSize: 9.2 },
      );

      ensureSpace(ctx, 4);
      ctx.doc.setDrawColor(...BORDER_COLOR);
      ctx.doc.line(ctx.marginLeft, ctx.y, ctx.width - ctx.marginRight, ctx.y);
      ctx.y += 4;
    });
  }

  addPageNumbers(ctx);
  doc.save(payload.fileName);
};

