/**
 * ============================================
 * VIGORRE ONE™ - GERADOR DE PDI
 * ============================================
 */

class PDI_Generator {
    constructor() {
        this.vigorAI = window.vigorAI || new VigorAI();
    }

    /**
     * Gera PDI completo em formato de texto
     */
    gerarPDITexto(resultados) {
        const cruzamento = this.vigorAI.cruzarDados(resultados);
        const pdi = this.vigorAI.gerarPDI(cruzamento);

        let texto = '';

        // Título
        texto += '📋 **PLANO DE DESENVOLVIMENTO INDIVIDUAL (PDI)**\n';
        texto += `📅 ${new Date().toISOString().split('T')[0]}\n\n`;
        texto += '---\n\n';

        // Diagnóstico
        texto += '## 1. DIAGNÓSTICO INICIAL\n\n';
        texto += `${pdi.diagnostico}\n\n`;
        texto += '---\n\n';

        // Objetivos
        texto += '## 2. OBJETIVOS\n\n';
        texto += '### 📅 Curto Prazo (0-90 dias)\n';
        pdi.objetivos.curto_prazo.forEach(o => { texto += `- ✅ ${o}\n`; });
        texto += '\n### 📅 Médio Prazo (3-6 meses)\n';
        pdi.objetivos.medio_prazo.forEach(o => { texto += `- ✅ ${o}\n`; });
        texto += '\n### 📅 Longo Prazo (6-12 meses)\n';
        pdi.objetivos.longo_prazo.forEach(o => { texto += `- ✅ ${o}\n`; });
        texto += '\n---\n\n';

        // Competências priorizadas
        texto += '## 3. COMPETÊNCIAS PRIORIZADAS\n\n';
        pdi.competencias_priorizadas.forEach(c => { texto += `- 🎯 ${c}\n`; });
        texto += '\n---\n\n';

        // Planos
        texto += '## 4. PLANO DE AÇÃO\n\n';
        texto += '### 📆 Diário\n';
        texto += `${pdi.plano_diario}\n\n`;
        texto += '### 📆 Semanal\n';
        texto += `${pdi.plano_semanal}\n\n`;
        texto += '### 📆 Mensal\n';
        texto += `${pdi.plano_mensal}\n\n`;
        texto += '---\n\n';

        // Recomendações
        texto += '## 5. RECOMENDAÇÕES\n\n';
        texto += '### 📚 Livros\n';
        pdi.recomendacoes.livros.forEach(l => { texto += `- ${l}\n`; });
        texto += '\n### 🎓 Cursos\n';
        pdi.recomendacoes.cursos.forEach(c => { texto += `- ${c}\n`; });
        texto += '\n### 🎙️ Podcasts e TED Talks\n';
        pdi.recomendacoes.podcasts.forEach(p => { texto += `- ${p}\n`; });
        texto += '\n### 🏋️ Exercícios\n';
        pdi.recomendacoes.exercicios.forEach(e => { texto += `- ${e}\n`; });
        texto += '\n---\n\n';

        // Plano 30/60/90/180/365
        texto += '## 6. PLANO 30/60/90/180/365 DIAS\n\n';
        pdi.plano_30_60_90_180_365.forEach(p => {
            texto += `### 📌 ${p.periodo} - ${p.titulo}\n`;
            texto += `${p.acoes}\n\n`;
        });
        texto += '---\n\n';

        // Assinatura
        texto += '🌟 **Este PDI foi gerado pela VIGOR AI™**\n';
        texto += 'A inteligência artificial exclusiva da Vigorre One™\n\n';
        texto += `📅 *${new Date().toISOString().split('T')[0]}*`;

        return texto;
    }

    /**
     * Gera PDI em formato HTML
     */
    gerarPDIHTML(resultados) {
        const texto = this.gerarPDITexto(resultados);

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDI | VIGORRE ONE™</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #F8FAFC; padding: 40px; color: #1E293B; line-height: 1.8; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 48px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        h1 { font-family: 'Poppins', sans-serif; font-size: 2rem; color: #0A2540; border-bottom: 2px solid #D97706; padding-bottom: 16px; margin-bottom: 24px; }
        h2 { font-family: 'Poppins', sans-serif; font-size: 1.4rem; color: #0A2540; margin: 32px 0 16px; }
        h3 { font-family: 'Poppins', sans-serif; font-size: 1.1rem; color: #0A2540; margin: 24px 0 12px; }
        ul { list-style: none; padding: 0; }
        ul li { padding: 6px 0; }
        .badge { display: inline-block; padding: 4px 16px; background: #D97706; color: white; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .section { margin: 32px 0; padding: 24px; background: #F8FAFC; border-radius: 10px; border-left: 4px solid #D97706; }
        .footer { margin-top: 40px; padding-top: 24px; border-top: 2px solid #E2E8F0; text-align: center; font-size: 0.8rem; color: #94A3B8; }
        .btn { padding: 10px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #D97706, #F59E0B); color: white; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(217,119,6,0.3); }
        @media print { body { background: white; padding: 0; } .container { box-shadow: none; border: none; } .btn { display: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-family:'Poppins',sans-serif;font-size:1.8rem;font-weight:900;color:#0A2540;">
                VIGORRE <span style="color:#D97706;">ONE</span><span style="font-size:0.6rem;vertical-align:super;color:#94A3B8;">™</span>
            </div>
            <div style="font-size:0.7rem;color:#94A3B8;letter-spacing:0.1em;text-transform:uppercase;">People Analytics Enterprise</div>
        </div>
        <div style="white-space:pre-wrap;font-size:0.95rem;">${texto}</div>
        <div style="text-align:center;margin-top:32px;">
            <button class="btn" onclick="window.print()">🖨️ Imprimir</button>
        </div>
        <div class="footer">
            VIGORRE ONE™ · People Analytics Enterprise · Gerado pela VIGOR AI™
        </div>
    </div>
</body>
</html>`;
    }
}

if (typeof window !== 'undefined') {
    window.PDI_Generator = PDI_Generator;
    console.log('📋 Gerador de PDI carregado com sucesso!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDI_Generator;
}
