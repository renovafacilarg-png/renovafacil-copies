import { useCallback } from 'react';
import type { GeneratedCopy } from '@/types';
import jsPDF from 'jspdf';

export function useExport() {
  const exportToHTML = useCallback((copies: GeneratedCopy[], filename: string) => {
    const funnelColors: Record<string, string> = {
      tof: '#ff6b35',
      mof: '#ffd700',
      bof: '#4ade80',
      metralleta: '#ec4899',
      hibrido: '#8b5cf6'
    };

    let videosHTML = '';
    copies.forEach((copy, i) => {
      videosHTML += `
        <div class="video-card">
          <div class="video-header" style="border-left-color: ${funnelColors[copy.funnel] || funnelColors.tof}">
            <div class="video-number">VIDEO ${i + 1}</div>
            <div class="video-meta">
              <span class="tag persona">${copy.persona.emoji} ${copy.persona.name}</span>
              <span class="tag funnel" style="background: ${funnelColors[copy.funnel] || funnelColors.tof}; color: ${copy.funnel === 'mof' ? '#1a1a1a' : 'white'}">${copy.funnel.toUpperCase()}</span>
              <span class="tag time">~${copy.time}s</span>
              <span class="tag words">${copy.words} palabras</span>
            </div>
          </div>
          
          <div class="scenes">
            <div class="scene">
              <div class="scene-header atencion">🎯 ATENCIÓN <span class="scene-time">(0-5 seg)</span></div>
              <div class="scene-content">
                <div class="copy-section">
                  <div class="section-label">🎤 COPY:</div>
                  <div class="copy-text">${copy.atencion}</div>
                </div>
                <div class="visual-section">
                  <div class="section-label">🎬 VISUAL:</div>
                  <div class="visual-text">${copy.visual_atencion || 'Sin sugerencia'}</div>
                </div>
              </div>
            </div>
            
            <div class="scene">
              <div class="scene-header interes">🧲 INTERÉS <span class="scene-time">(5-15 seg)</span></div>
              <div class="scene-content">
                <div class="copy-section">
                  <div class="section-label">🎤 COPY:</div>
                  <div class="copy-text">${copy.interes}</div>
                </div>
                <div class="visual-section">
                  <div class="section-label">🎬 VISUAL:</div>
                  <div class="visual-text">${copy.visual_interes || 'Sin sugerencia'}</div>
                </div>
              </div>
            </div>
            
            <div class="scene">
              <div class="scene-header deseo">🔥 DESEO <span class="scene-time">(15-35 seg)</span></div>
              <div class="scene-content">
                <div class="copy-section">
                  <div class="section-label">🎤 COPY:</div>
                  <div class="copy-text">${copy.deseo}</div>
                </div>
                <div class="visual-section">
                  <div class="section-label">🎬 VISUAL:</div>
                  <div class="visual-text">${copy.visual_deseo || 'Sin sugerencia'}</div>
                </div>
              </div>
            </div>
            
            <div class="scene">
              <div class="scene-header accion">🚀 ACCIÓN <span class="scene-time">(35-45 seg)</span></div>
              <div class="scene-content">
                <div class="copy-section">
                  <div class="section-label">🎤 COPY:</div>
                  <div class="copy-text">${copy.accion}</div>
                </div>
                <div class="visual-section">
                  <div class="section-label">🎬 VISUAL:</div>
                  <div class="visual-text">${copy.visual_accion || 'Sin sugerencia'}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="full-copy">
            <div class="full-copy-label">📝 COPY COMPLETO:</div>
            <div class="full-copy-text">${copy.fullText}</div>
          </div>
        </div>
      `;
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Planilla Editora - RenovaFácil</title>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root { --verde: #3D6B4B; --azul: #2D8BC9; --bg: #0a0f0a; --card: rgba(15, 25, 15, 0.95); --text: #e8e8e8; --muted: #888; --tof: #ff6b35; --mof: #ffd700; --bof: #4ade80; --ai: #a855f7; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Space Grotesk', sans-serif; background: var(--bg); color: var(--text); padding: 20px; max-width: 900px; margin: 0 auto; }
      .header { text-align: center; padding: 30px; background: linear-gradient(135deg, var(--verde), var(--azul)); border-radius: 16px; margin-bottom: 30px; }
      .logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 3px; }
      .logo .renova { color: #90EE90; } .logo .facil { color: #87CEEB; }
      .header h1 { font-size: 1.2rem; margin-top: 10px; opacity: 0.9; }
      .video-card { background: var(--card); border-radius: 16px; margin-bottom: 30px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
      .video-header { padding: 20px; background: rgba(0,0,0,0.3); border-left: 5px solid; display: flex; align-items: center; gap: 15px; flex-wrap: wrap; }
      .video-number { font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem; letter-spacing: 2px; }
      .video-meta { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
      .tag { padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
      .tag.persona { background: rgba(45,139,201,0.2); color: var(--azul); }
      .tag.time { background: rgba(61,107,75,0.2); color: var(--verde); }
      .tag.words { background: rgba(255,255,255,0.1); color: var(--muted); }
      .scenes { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
      .scene { background: rgba(0,0,0,0.2); border-radius: 10px; overflow: hidden; }
      .scene-header { padding: 12px 15px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
      .scene-header.atencion { background: rgba(255,107,53,0.2); color: var(--tof); }
      .scene-header.interes { background: rgba(45,139,201,0.2); color: var(--azul); }
      .scene-header.deseo { background: rgba(255,215,0,0.15); color: var(--mof); }
      .scene-header.accion { background: rgba(74,222,128,0.15); color: var(--bof); }
      .scene-time { font-weight: 400; opacity: 0.7; font-size: 0.7rem; }
      .scene-content { padding: 15px; display: grid; gap: 12px; }
      .section-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; color: var(--muted); }
      .copy-section .section-label { color: var(--verde); }
      .visual-section .section-label { color: var(--ai); }
      .copy-text { font-size: 1rem; line-height: 1.6; color: var(--text); padding: 12px; background: rgba(61,107,75,0.1); border-radius: 8px; border-left: 3px solid var(--verde); }
      .visual-text { font-size: 0.9rem; line-height: 1.5; color: var(--ai); padding: 12px; background: rgba(168,85,247,0.1); border-radius: 8px; border: 1px dashed rgba(168,85,247,0.3); font-style: italic; }
      .full-copy { padding: 20px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1); }
      .full-copy-label { font-size: 0.75rem; font-weight: 700; color: var(--verde); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
      .full-copy-text { font-size: 0.95rem; line-height: 1.7; color: var(--text); padding: 15px; background: rgba(61,107,75,0.1); border-radius: 8px; border: 1px solid rgba(61,107,75,0.3); }
      .footer { text-align: center; padding: 30px; color: var(--muted); font-size: 0.8rem; }
      @media print { body { background: white; color: black; } .video-card { break-inside: avoid; border: 1px solid #ccc; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo"><span class="renova">RENOVA</span><span class="facil">FÁCIL</span></div>
        <h1>📋 Planilla para Editora</h1>
        <div>${new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div style="margin-top: 15px; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: 600;">📹 ${copies.length} videos para editar</div>
    </div>
    ${videosHTML}
    <div class="footer">
        <div class="logo" style="font-size: 1.3rem; margin-bottom: 8px;"><span class="renova">RENOVA</span><span class="facil">FÁCIL</span></div>
        Generado automáticamente
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportToPDF = useCallback(async (copies: GeneratedCopy[], filename: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFillColor(61, 107, 75);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(144, 238, 144);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RENOVA', 20, 25);
    
    doc.setTextColor(135, 206, 235);
    doc.text('FÁCIL', 65, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Planilla para Editora', 20, 35);
    
    let y = 50;
    
    copies.forEach((copy, i) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      // Video number
      doc.setTextColor(255, 107, 53);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`VIDEO ${i + 1} - ${copy.funnel.toUpperCase()}`, 20, y);
      y += 10;
      
      // Persona
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${copy.persona.emoji} ${copy.persona.name} | ${copy.words} palabras | ~${copy.time}s`, 20, y);
      y += 15;
      
      // Copy sections
      const sections = [
        { label: 'ATENCIÓN', text: copy.atencion },
        { label: 'INTERÉS', text: copy.interes },
        { label: 'DESEO', text: copy.deseo },
        { label: 'ACCIÓN', text: copy.accion }
      ];
      
      sections.forEach(section => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.setTextColor(61, 107, 75);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(section.label, 20, y);
        y += 5;
        
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        const splitText = doc.splitTextToSize(section.text, 170);
        doc.text(splitText, 20, y);
        y += splitText.length * 4 + 8;
      });
      
      y += 10;
    });
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  }, []);

  const exportBatchForEditor = useCallback((copies: GeneratedCopy[], filename: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let content = `🎬 LOTE DE COPIES - RENOVAFÁCIL
📅 Fecha: ${dateStr}
🕐 Hora: ${timeStr}
📹 Total de videos: ${copies.length}
${'='.repeat(60)}

`;

    copies.forEach((copy, i) => {
      content += `
🔷 VIDEO ${i + 1} - ${copy.funnel.toUpperCase()}
👤 Persona: ${copy.persona.emoji} ${copy.persona.name}
⏱️ Duración: ~${copy.time}s | 📝 ${copy.words} palabras
${'-'.repeat(50)}

🎯 ATENCIÓN:
${copy.atencion}

🎬 Visual: ${copy.visual_atencion || 'Sin sugerencia'}

🧲 INTERÉS:
${copy.interes}

🎬 Visual: ${copy.visual_interes || 'Sin sugerencia'}

🔥 DESEO:
${copy.deseo}

🎬 Visual: ${copy.visual_deseo || 'Sin sugerencia'}

🚀 ACCIÓN:
${copy.accion}

🎬 Visual: ${copy.visual_accion || 'Sin sugerencia'}

📝 COPY COMPLETO:
${copy.fullText}

${'='.repeat(60)}
`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${now.toISOString().split('T')[0]}_${timeStr.replace(':', '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportBatchForAudioGeneration = useCallback((copies: GeneratedCopy[], filename: string) => {
    // Crear texto limpio con solo los copies uno debajo del otro
    const allTexts = copies.map(copy => copy.fullText).join('\n\n');
    
    const content = allTexts;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    exportToHTML,
    exportToPDF,
    exportBatchForEditor,
    exportBatchForAudioGeneration
  };
}
