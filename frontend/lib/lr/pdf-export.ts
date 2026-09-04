// lib/lr/pdf-export.ts
// Renders <LRReceiptRenderer/> off-screen for a piece of data + config,
// captures it with html2canvas, and drops it into a jsPDF page.
// This guarantees PDF/WhatsApp output always matches whatever template
// & fields the company has configured — there is no second copy of the
// layout to keep in sync.
//
// npm install html2canvas   (jspdf you already have)

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import LRReceiptRenderer from "@/components/lr/LRReceiptRenderer";
import type { LRTemplateConfig, ReceiptData } from "@/lib/lr/template-config";

const RENDER_WIDTH = 760; // px, roughly A4-ish proportion at typical DPI scale

async function renderOffscreen(config: LRTemplateConfig, data: ReceiptData): Promise<{ node: HTMLDivElement; root: Root }> {
  const node = document.createElement("div");
  node.style.position = "fixed";
  node.style.left = "-99999px";
  node.style.top = "0";
  node.style.background = "#ffffff";
  document.body.appendChild(node);

  const root = createRoot(node);
  root.render(React.createElement(LRReceiptRenderer, { config, data, width: RENDER_WIDTH }));

  // Wait for React to commit the receipt before capturing it.
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = res;
              img.onerror = res;
            })
    )
  );

  return { node, root };
}

function cleanup(node: HTMLDivElement, root: Root) {
  root.unmount();
  node.remove();
}

/**
 * Builds a multi-page jsPDF from a list of (data, config) receipts.
 * Pass the SAME config for every item that shares a template, or a
 * per-item config if you ever support per-LR overrides.
 */
export async function buildReceiptsPdf(
  items: { data: ReceiptData; config: LRTemplateConfig }[]
) {
  const html2canvas = (await import("html2canvas")).default;
  const { default: jsPDF } = await import("jspdf");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = 210, pageH = 297, margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  for (let i = 0; i < items.length; i++) {
    const { data, config } = items[i];
    const { node, root } = await renderOffscreen(config, data);
    try {
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const imgW = maxW;
      const imgH = Math.min((canvas.height * imgW) / canvas.width, maxH);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, margin, imgW, imgH);
    } finally {
      cleanup(node, root);
    }
  }

  return pdf;
}

/** Convenience: build + save a PDF for one or more receipts. */
export async function downloadReceiptsPdf(
  items: { data: ReceiptData; config: LRTemplateConfig }[],
  filename: string
) {
  const pdf = await buildReceiptsPdf(items);
  pdf.save(filename);
  return pdf;
}