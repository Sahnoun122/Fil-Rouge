import { jsPDF } from 'jspdf';
import {
  MainObjective,
  OBJECTIVE_LABELS,
  StrategyPdfExportPayload,
  Tone,
  TONE_LABELS,
} from '../types/strategy.types';

type RenderContext = {
  doc: jsPDF;
  payload: StrategyPdfExportPayload;
  cursorY: number;
  pageWidth: number;
  pageHeight: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  bodyTop: number;
};

const TITLE_COLOR: [number, number, number] = [15, 23, 42];
const MUTED_COLOR: [number, number, number] = [100, 116, 139];
const ACCENT_COLOR: [number, number, number] = [14, 116, 144];
const BORDER_COLOR: [number, number, number] = [226, 232, 240];

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatLabel = (key: string): string =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPrimitive = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const addBodyHeader = (ctx: RenderContext) => {
  const { doc, payload, pageWidth } = ctx;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, 14, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.line(0, 14, pageWidth, 14);

  doc.setTextColor(...MUTED_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(payload.businessInfo.businessName, ctx.marginLeft, 9.5);
  doc.text(formatDate(payload.exportedAt), pageWidth - ctx.marginRight, 9.5, { align: 'right' });
};

const addBodyPage = (ctx: RenderContext) => {
  ctx.doc.addPage();
  addBodyHeader(ctx);
  ctx.cursorY = ctx.bodyTop;
};

const ensureSpace = (ctx: RenderContext, requiredHeight: number) => {
  if (ctx.cursorY + requiredHeight > ctx.pageHeight - ctx.marginBottom) {
    addBodyPage(ctx);
  }
};

const addWrappedText = (
  ctx: RenderContext,
  text: string,
  x: number,
  maxWidth: number,
  options: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold';
    color?: [number, number, number];
    lineHeight?: number;
  } = {},
) => {
  const fontSize = options.fontSize ?? 10;
  const fontStyle = options.fontStyle ?? 'normal';
  const color = options.color ?? TITLE_COLOR;
  const lineHeight = options.lineHeight ?? 5.2;
  const lines = ctx.doc.splitTextToSize(text, maxWidth) as string[];

  ctx.doc.setFont('helvetica', fontStyle);
  ctx.doc.setFontSize(fontSize);
  ctx.doc.setTextColor(...color);

  lines.forEach((line) => {
    ensureSpace(ctx, lineHeight);
    ctx.doc.text(line, x, ctx.cursorY);
    ctx.cursorY += lineHeight;
  });
};

const addBulletItem = (ctx: RenderContext, text: string, indentLevel = 0) => {
  const indent = indentLevel * 6;
  const x = ctx.marginLeft + indent;
  const bulletX = x;
  const textX = x + 3.5;
  const width = ctx.pageWidth - ctx.marginRight - textX;
  const lines = ctx.doc.splitTextToSize(text, width) as string[];
  const lineHeight = 5.1;

  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(...TITLE_COLOR);

  lines.forEach((line, index) => {
    ensureSpace(ctx, lineHeight);
    if (index === 0) {
      ctx.doc.text('\u2022', bulletX, ctx.cursorY);
    }
    ctx.doc.text(line, textX, ctx.cursorY);
    ctx.cursorY += lineHeight;
  });
};

const renderContentNode = (ctx: RenderContext, value: unknown, indentLevel = 0) => {
  if (value === null || value === undefined || value === '') {
    addWrappedText(
      ctx,
      'Information non renseignee.',
      ctx.marginLeft + indentLevel * 6,
      ctx.pageWidth - ctx.marginLeft - ctx.marginRight - indentLevel * 6,
      { fontSize: 10, color: MUTED_COLOR },
    );
    return;
  }

  if (isPrimitive(value)) {
    addWrappedText(
      ctx,
      String(value),
      ctx.marginLeft + indentLevel * 6,
      ctx.pageWidth - ctx.marginLeft - ctx.marginRight - indentLevel * 6,
      { fontSize: 10, color: TITLE_COLOR },
    );
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      addWrappedText(
        ctx,
        'Aucun element.',
        ctx.marginLeft + indentLevel * 6,
        ctx.pageWidth - ctx.marginLeft - ctx.marginRight - indentLevel * 6,
        { fontSize: 10, color: MUTED_COLOR },
      );
      return;
    }

    value.forEach((item, index) => {
      if (isPrimitive(item)) {
        addBulletItem(ctx, String(item), indentLevel);
        return;
      }

      addBulletItem(ctx, `Element ${index + 1}`, indentLevel);
      renderContentNode(ctx, item, indentLevel + 1);
    });

    return;
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([, content]) => content !== null && content !== undefined && content !== '');
    if (entries.length === 0) {
      addWrappedText(
        ctx,
        'Information non renseignee.',
        ctx.marginLeft + indentLevel * 6,
        ctx.pageWidth - ctx.marginLeft - ctx.marginRight - indentLevel * 6,
        { fontSize: 10, color: MUTED_COLOR },
      );
      return;
    }

    entries.forEach(([key, content]) => {
      const label = formatLabel(key);
      if (isPrimitive(content)) {
        addWrappedText(
          ctx,
          `${label}: ${String(content)}`,
          ctx.marginLeft + indentLevel * 6,
          ctx.pageWidth - ctx.marginLeft - ctx.marginRight - indentLevel * 6,
          { fontSize: 10, color: TITLE_COLOR },
        );
      } else {
        addWrappedText(
          ctx,
          label,
          ctx.marginLeft + indentLevel * 6,
          ctx.pageWidth - ctx.marginLeft - ctx.marginRight - indentLevel * 6,
          { fontSize: 10, fontStyle: 'bold', color: TITLE_COLOR },
        );
        renderContentNode(ctx, content, indentLevel + 1);
      }
      ctx.cursorY += 1.2;
    });
  }
};

const drawCoverPage = (ctx: RenderContext) => {
  const { doc, payload, pageWidth } = ctx;
  const objectiveLabel =
    OBJECTIVE_LABELS[payload.businessInfo.mainObjective as MainObjective] || payload.businessInfo.mainObjective;
  const toneLabel = TONE_LABELS[payload.businessInfo.tone as Tone] || payload.businessInfo.tone;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 62, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Strategie Marketing', ctx.marginLeft, 26);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Plan professionnel exporte en PDF', ctx.marginLeft, 36);

  doc.setTextColor(...TITLE_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(payload.businessInfo.businessName, ctx.marginLeft, 84);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...MUTED_COLOR);
  doc.text(payload.businessInfo.industry, ctx.marginLeft, 92);

  const metadataY = 112;
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(ctx.marginLeft, metadataY, pageWidth - ctx.marginLeft - ctx.marginRight, 64, 2.5, 2.5, 'S');

  doc.setFontSize(10);
  doc.setTextColor(...TITLE_COLOR);
  doc.text(`Audience cible: ${payload.businessInfo.targetAudience}`, ctx.marginLeft + 5, metadataY + 10);
  doc.text(`Localisation: ${payload.businessInfo.location}`, ctx.marginLeft + 5, metadataY + 20);
  doc.text(`Objectif principal: ${objectiveLabel}`, ctx.marginLeft + 5, metadataY + 30);
  doc.text(`Ton: ${toneLabel}`, ctx.marginLeft + 5, metadataY + 40);
  doc.text(
    `Budget: ${
      payload.businessInfo.budget
        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(payload.businessInfo.budget)
        : 'Non defini'
    }`,
    ctx.marginLeft + 5,
    metadataY + 50,
  );

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED_COLOR);
  doc.setFontSize(9.5);
  doc.text(`Cree le ${formatDate(payload.createdAt)}`, ctx.marginLeft, ctx.pageHeight - 22);
  doc.text(`Mis a jour le ${formatDate(payload.updatedAt)}`, ctx.marginLeft, ctx.pageHeight - 16);
  doc.text(`Export du ${formatDate(payload.exportedAt)}`, ctx.marginLeft, ctx.pageHeight - 10);
};

const drawPageNumbers = (ctx: RenderContext) => {
  const totalPages = ctx.doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    ctx.doc.setPage(page);
    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...MUTED_COLOR);
    ctx.doc.text(`${page} / ${totalPages}`, ctx.pageWidth - ctx.marginRight, ctx.pageHeight - 7, { align: 'right' });
  }
};

export const generateStrategyPdf = (payload: StrategyPdfExportPayload) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const ctx: RenderContext = {
    doc,
    payload,
    cursorY: 22,
    pageWidth,
    pageHeight,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 14,
    bodyTop: 24,
  };

  drawCoverPage(ctx);
  addBodyPage(ctx);

  addWrappedText(
    ctx,
    `Produit/Service: ${payload.businessInfo.productOrService}`,
    ctx.marginLeft,
    pageWidth - ctx.marginLeft - ctx.marginRight,
    { fontSize: 10, color: MUTED_COLOR },
  );
  ctx.cursorY += 3;

  payload.phases.forEach((phase) => {
    ensureSpace(ctx, 10);
    ctx.doc.setFillColor(241, 245, 249);
    ctx.doc.roundedRect(ctx.marginLeft, ctx.cursorY - 4.5, pageWidth - ctx.marginLeft - ctx.marginRight, 9, 2, 2, 'F');
    addWrappedText(
      ctx,
      `${phase.title} - ${phase.subtitle}`,
      ctx.marginLeft + 2.5,
      pageWidth - ctx.marginLeft - ctx.marginRight - 5,
      { fontSize: 12, fontStyle: 'bold', color: ACCENT_COLOR, lineHeight: 5.8 },
    );
    ctx.cursorY += 2;

    phase.sections.forEach((section) => {
      ensureSpace(ctx, 8);
      addWrappedText(
        ctx,
        section.title,
        ctx.marginLeft,
        pageWidth - ctx.marginLeft - ctx.marginRight,
        { fontSize: 11, fontStyle: 'bold', color: TITLE_COLOR, lineHeight: 5.4 },
      );
      renderContentNode(ctx, section.content, 0);
      ctx.cursorY += 3;
    });
  });

  drawPageNumbers(ctx);
  doc.save(payload.fileName);
};

