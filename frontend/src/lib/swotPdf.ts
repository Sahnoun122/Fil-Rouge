import { jsPDF } from 'jspdf';
import { SwotPdfExportPayload } from '../types/swot.types';

type PdfContext = {
  doc: jsPDF;
  payload: SwotPdfExportPayload;
  y: number;
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  contentTop: number;
};

const TITLE_COLOR: [number, number, number] = [15, 23, 42];
const MUTED_COLOR: [number, number, number] = [100, 116, 139];
const BORDER_COLOR: [number, number, number] = [226, 232, 240];
const ACCENT_COLOR: [number, number, number] = [8, 145, 178];

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const addBodyHeader = (ctx: PdfContext) => {
  const { doc, payload, width } = ctx;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, 14, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.line(0, 14, width, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_COLOR);
  doc.text(payload.title, ctx.marginLeft, 9.5);
  doc.text(formatDate(payload.exportedAt), width - ctx.marginRight, 9.5, { align: 'right' });
};

const addBodyPage = (ctx: PdfContext) => {
  ctx.doc.addPage();
  addBodyHeader(ctx);
  ctx.y = ctx.contentTop;
};

const ensureSpace = (ctx: PdfContext, required: number) => {
  if (ctx.y + required > ctx.height - ctx.marginBottom) {
    addBodyPage(ctx);
  }
};

const addWrappedText = (
  ctx: PdfContext,
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
    ctx.doc.text(line, x, ctx.y);
    ctx.y += lineHeight;
  });
};

const addList = (ctx: PdfContext, items: string[]) => {
  if (items.length === 0) {
    addWrappedText(
      ctx,
      'No items.',
      ctx.marginLeft,
      ctx.width - ctx.marginLeft - ctx.marginRight,
      { color: MUTED_COLOR },
    );
    return;
  }

  items.forEach((item) => {
    const textX = ctx.marginLeft + 4;
    const maxWidth = ctx.width - ctx.marginRight - textX;
    const lines = ctx.doc.splitTextToSize(item, maxWidth) as string[];

    lines.forEach((line, index) => {
      ensureSpace(ctx, 5.1);
      if (index === 0) {
        ctx.doc.setTextColor(...TITLE_COLOR);
        ctx.doc.text('\u2022', ctx.marginLeft, ctx.y);
      }
      ctx.doc.setTextColor(...TITLE_COLOR);
      ctx.doc.text(line, textX, ctx.y);
      ctx.y += 5.1;
    });
  });
};

const drawCover = (ctx: PdfContext) => {
  const { doc, payload, width, height } = ctx;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, width, 66, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('SWOT Analytics Report', ctx.marginLeft, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Professional PDF export', ctx.marginLeft, 37);

  doc.setTextColor(...TITLE_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text(payload.title, ctx.marginLeft, 86);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...MUTED_COLOR);
  doc.text(
    `${payload.strategy.businessName} - ${payload.strategy.industry}`,
    ctx.marginLeft,
    94,
  );

  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(ctx.marginLeft, 108, width - ctx.marginLeft - ctx.marginRight, 66, 2.5, 2.5, 'S');

  doc.setTextColor(...TITLE_COLOR);
  doc.setFontSize(10);
  doc.text(`Type: ${payload.isAiGenerated ? 'AI SWOT' : 'Manual SWOT'}`, ctx.marginLeft + 5, 118);
  doc.text(`User: ${payload.user.fullName}`, ctx.marginLeft + 5, 128);
  doc.text(`Email: ${payload.user.email}`, ctx.marginLeft + 5, 138);
  doc.text(`Company: ${payload.user.companyName || '-'}`, ctx.marginLeft + 5, 148);
  doc.text(`Strategy: ${payload.strategy.businessName}`, ctx.marginLeft + 5, 158);
  doc.text(`Created: ${formatDate(payload.createdAt)}`, ctx.marginLeft + 5, 168);

  doc.setTextColor(...MUTED_COLOR);
  doc.setFontSize(9.5);
  doc.text(`Export date: ${formatDate(payload.exportedAt)}`, ctx.marginLeft, height - 10);
};

const drawPageNumbers = (ctx: PdfContext) => {
  const pages = ctx.doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    ctx.doc.setPage(page);
    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...MUTED_COLOR);
    ctx.doc.text(`${page} / ${pages}`, ctx.width - ctx.marginRight, ctx.height - 7, { align: 'right' });
  }
};

const drawSectionTitle = (ctx: PdfContext, title: string) => {
  ensureSpace(ctx, 9);
  ctx.doc.setFillColor(241, 245, 249);
  ctx.doc.roundedRect(
    ctx.marginLeft,
    ctx.y - 4.5,
    ctx.width - ctx.marginLeft - ctx.marginRight,
    9,
    2,
    2,
    'F',
  );
  addWrappedText(
    ctx,
    title,
    ctx.marginLeft + 2.5,
    ctx.width - ctx.marginLeft - ctx.marginRight - 5,
    { fontSize: 12, fontStyle: 'bold', color: ACCENT_COLOR, lineHeight: 5.8 },
  );
  ctx.y += 2;
};

export const generateSwotPdf = (payload: SwotPdfExportPayload) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  const ctx: PdfContext = {
    doc,
    payload,
    y: 24,
    width,
    height,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 14,
    contentTop: 24,
  };

  drawCover(ctx);
  addBodyPage(ctx);

  drawSectionTitle(ctx, 'Inputs');
  addWrappedText(
    ctx,
    `Internal notes: ${payload.inputs.notesInternes || '-'}`,
    ctx.marginLeft,
    width - ctx.marginLeft - ctx.marginRight,
    { fontSize: 10 },
  );
  addWrappedText(
    ctx,
    `External notes: ${payload.inputs.notesExternes || '-'}`,
    ctx.marginLeft,
    width - ctx.marginLeft - ctx.marginRight,
    { fontSize: 10 },
  );
  addWrappedText(
    ctx,
    `Competitors: ${(payload.inputs.concurrents || []).join(', ') || '-'}`,
    ctx.marginLeft,
    width - ctx.marginLeft - ctx.marginRight,
    { fontSize: 10 },
  );
  addWrappedText(
    ctx,
    `Resources: ${(payload.inputs.ressources || []).join(', ') || '-'}`,
    ctx.marginLeft,
    width - ctx.marginLeft - ctx.marginRight,
    { fontSize: 10 },
  );
  addWrappedText(
    ctx,
    `Objectives: ${payload.inputs.objectifs || '-'}`,
    ctx.marginLeft,
    width - ctx.marginLeft - ctx.marginRight,
    { fontSize: 10 },
  );
  ctx.y += 3;

  drawSectionTitle(ctx, 'Strengths');
  addList(ctx, payload.matrix.strengths || []);
  ctx.y += 3;

  drawSectionTitle(ctx, 'Weaknesses');
  addList(ctx, payload.matrix.weaknesses || []);
  ctx.y += 3;

  drawSectionTitle(ctx, 'Opportunities');
  addList(ctx, payload.matrix.opportunities || []);
  ctx.y += 3;

  drawSectionTitle(ctx, 'Threats');
  addList(ctx, payload.matrix.threats || []);

  drawPageNumbers(ctx);
  doc.save(payload.fileName);
};
