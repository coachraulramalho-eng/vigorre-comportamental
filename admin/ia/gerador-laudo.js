/**
 * ============================================
 * VIGORRE ONE™ - GERADOR DE LAUDO
 * ============================================
 */

class GeradorLaudo {
    constructor() {
        this.vigorAI = window.vigorAI || new VigorAI();
    }

    /**
     * Gera o laudo completo em formato HTML
     */
    gerarHTMLLaudo(resultados) {
        const laudo = this.vigorAI.gerarLaudo(resultados);
        const cruzamento = laudo.cruzamento;
        const insights = laudo.insights_executivos;
        const pdi = laudo.pdi;

        let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Laudo VIGOR® | VIGORRE ONE™</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #F8FAFC;
            padding: 40px;
            color: #1E293B;
        }
        .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 48px; }
        .header { text-align: center; padding-bottom: 32px; border-bottom: 2px solid #E2E8F0; margin-bottom: 32px; }
        .header .logo { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 900; color: #0A2540; }
        .header .logo .highlight { color: #D97706; }
        .header .logo .tm { font-size: 0.6rem; vertical-align: super; color: #94A3B8; }
        .header .sub { font-size: 0.8rem; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; }
        .header .title { font-family: 'Poppins', sans-serif; font-size: 1.8rem; font-weight: 700; margin: 16px 0 8px; }
        .header .title .gold { color: #D97706; }
        .header .badge { display: inline-block; padding: 4px 20px; background: #D97706; color: white; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .section { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E2E8F0; }
        .section:last-child { border-bottom: none; }
        .section-title { font-family: 'Poppins', sans-serif; font-size: 1.2rem; font-weight: 700; color: #0A2540; margin-bottom: 12px; }
        .section-title .num { display: inline-block; width: 28px; height: 28px; background: #D97706; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-size: 0.8rem; margin-right: 8px; }
        .text { color: #475569; line-height: 1.8; font-size: 0.95rem; }
        .text strong { color: #0A2540; }
        .card { background: #F8FAFC; border-radius: 10px; padding: 16px 20px; border: 1px solid #E2E8F0; margin: 8px 0; }
        .card .icon { font-size: 1.2rem; }
        .card .label { font-weight: 600; color: #0A2540; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
        .bar { height: 4px; background: #E2E8F0; border-radius: 2px; margin-top: 6px; overflow: hidden; }
        .bar .fill { height: 100%; border-radius: 2px; }
        .btn { padding: 10px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-primary { background: linear-gradient(135deg, #D97706, #F59E0B); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(217,119,6,0.3); }
        .footer { text-align: center; padding-top: 32px; border-top: 2px solid #E2E8F0; margin-top: 32px; font-size: 0.8rem; color: #94A3B8; }
        @media (max-width: 768px) { body { padding: 16px; } .container { padding: 24px; } .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } }
        @media print { body { background: white; padding: 0; } .container { box-shadow: none; border: none; } .btn { display: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VIGORRE <span class="highlight">ONE</span><span class="tm">™</span></div>
            <div class="sub">People Analytics Enterprise</div>
            <div class="title">Laudo <span class="gold">Comportamental</span> VIGOR®</div>
            <div class="badge">⭐ Metodologia Exclusiva VIGOR®</div>
            <div style="margin-top:16px; font-size:0.9rem; color:#64748B;">
                <strong>Participante:</strong> ${laudo.cabecalho.participante} &nbsp;|&nbsp;
                <strong>Data:</strong> ${new Date(laudo.cabecalho.data).toLocaleDateString('pt-BR')} &nbsp;|&nbsp;
                <strong>Testes:</strong> ${laudo.cabecalho.testes_realizados.join(', ')}
            </div>
        </div>
`;

        // ============================================
        // PERFIL PREDOMINANTE
        // ============================================
        if (cruzamento.disc) {
            const disc = cruzamento.disc;
            html += `
        <div class="section">
            <h2 class="section-title"><span class="num">1</span> Perfil Predominante</h2>
            <div style="text-align:center;padding:24px;background:#FEF3C7;border-radius:10px;margin:12px 0;">
                <div style="font-size:3rem;">${disc.perfil.icone}</div>
                <div style="font-family:'Poppins',sans-serif;font-size:1.4rem;font-weight:700;color:#0A2540;">${disc.perfil.nome}</div>
                <div style="color:#64748B;">${disc.perfil.descricao}</div>
                <div style="margin-top:8px;color:#D97706;font-weight:600;">${disc.percentuais[disc.dominante]}% de dominância</div>
            </div>
            <div class="grid-4">
                ${['D','I','S','C'].map(k => `
                <div class="card" style="${k === disc.dominante ? 'border-color:#D97706;border-width:2px;' : ''}">
                    <div><span style="font-weight:700;">${k}</span> ${disc.percentuais[k]||0}%</div>
                    <div class="bar"><div class="fill" style="width:${disc.percentuais[k]||0}%;background:${k === 'D' ? '#EF4444' : k === 'I' ? '#3B82F6' : k === 'S' ? '#10B981' : '#8B5CF6'};"></div></div>
                </div>
                `).join('')}
            </div>
        </div>
`;
        }

        // ============================================
        // BIG FIVE
        // ============================================
        if (cruzamento.bigfive) {
            const bf = cruzamento.bigfive;
            html += `
        <div class="section">
            <h2 class="section-title"><span class="num">2</span> Big Five</h2>
            <div class="grid-3">
                ${['O','C','E','A','N'].map(k => `
                <div class="card">
                    <div><span style="font-weight:700;">${k}</span> ${bf.resultados[k]?.valor || 0}%</div>
                    <div style="font-size:0.8rem;color:#64748B;">${bf.resultados[k]?.nivel || '-'}</div>
                    <div class="bar"><div class="fill" style="width:${bf.resultados[k]?.valor || 0}%;background:${k === 'O' ? '#8B5CF6' : k === 'C' ? '#10B981' : k === 'E' ? '#F59E0B' : k === 'A' ? '#EC4899' : '#EF4444'};"></div></div>
                </div>
                `).join('')}
            </div>
            <div class="text">${bf.descricao_completa}</div>
        </div>
`;
        }

        // ============================================
        // INTELIGÊNCIA EMOCIONAL
        // ============================================
        if (cruzamento.ie) {
            const ie = cruzamento.ie;
            html += `
        <div class="section">
            <h2 class="section-title"><span class="num">3</span> Inteligência Emocional</h2>
            <div style="text-align:center;padding:16px;background:#F8FAFC;border-radius:10px;margin:12px 0;">
                <div style="font-size:2rem;font-weight:700;color:${ie.indice_geral >= 60 ? '#10B981' : ie.indice_geral >= 40 ? '#F59E0B' : '#EF4444'}">${ie.indice_geral}%</div>
                <div style="font-weight:600;">${ie.nivel_geral}</div>
            </div>
            <div class="grid-2">
                ${Object.keys(ie.resultados).map(k => `
                <div class="card">
                    <div><span style="font-weight:700;">${ie.resultados[k].icone} ${k}</span> ${ie.resultados[k].valor}%</div>
                    <div style="font-size:0.8rem;color:#64748B;">${ie.resultados[k].nivel}</div>
                    <div class="bar"><div class="fill" style="width:${ie.resultados[k].valor}%;background:${ie.resultados[k].valor >= 60 ? '#10B981' : '#F59E0B'};"></div></div>
                </div>
                `).join('')}
            </div>
            <div class="text">${ie.descricao_completa}</div>
        </div>
`;
        }

        // ============================================
        // VALORES
        // ============================================
        if (cruzamento.valores) {
            const valores = cruzamento.valores;
            html += `
        <div class="section">
            <h2 class="section-title"><span class="num">4</span> Valores</h2>
            <div class="grid-3">
                ${valores.top3.map(v => `
                <div class="card" style="border-color:#D97706;border-width:2px;">
                    <div><span style="font-weight:700;">${v[0]}</span> ${v[1]}%</div>
                    <div class="bar"><div class="fill" style="width:${v[1]}%;background:#D97706;"></div></div>
                </div>
                `).join('')}
            </div>
            <div class="text">${valores.descricao_completa}</div>
        </div>
`;
        }

        // ============================================
        // SWOT
        // ============================================
        if (cruzamento.swot) {
            const swot = cruzamento.swot;
            html += `
        <div class="section">
            <h2 class="section-title"><span class="num">5</span> SWOT</h2>
            <div class="grid-2">
                ${Object.keys(swot.resultados).map(k => `
                <div class="card">
                    <div><span style="font-weight:700;">${swot.resultados[k].icone} ${k}</span> ${swot.resultados[k].valor}%</div>
                    <div style="font-size:0.8rem;color:#64748B;">${swot.resultados[k].nivel}</div>
                    <div class="bar"><div class="fill" style="width:${swot.resultados[k].valor}%;background:${k === 'Forças' ? '#10B981' : k === 'Fraquezas' ? '#EF4444' : k === 'Oportunidades' ? '#3B82F6' : '#F59E0B'};"></div></div>
                </div>
                `).join('')}
            </div>
            <div class="text">${swot.descricao_completa}</div>
        </div>
`;
        }

        // ============================================
        // INSIGHTS EXECUTIVOS
        // ============================================
        html += `
        <div class="section">
            <h2 class="section-title"><span class="num">6</span> Insights Executivos</h2>
            <div class="card">
                <div style="font-weight:600;color:#0A2540;">🎯 Score de Liderança</div>
                <div style="font-size:2rem;font-weight:700;color:${insights.score_lideranca >= 70 ? '#10B981' : insights.score_lideranca >= 50 ? '#F59E0B' : '#EF4444'}">${insights.score_lideranca}%</div>
            </div>
            <div class="card">
                <div style="font-weight:600;color:#0A2540;">🚀 Score de Potencial</div>
                <div style="font-size:2rem;font-weight:700;color:${insights.score_potencial >= 70 ? '#10B981' : insights.score_potencial >= 50 ? '#F59E0B' : '#EF4444'}">${insights.score_potencial}%</div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">💪 Forças</div>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        ${insights.forcas.map(f => `<li style="padding:4px 0;font-size:0.9rem;">✅ ${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">📈 Desafios</div>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        ${insights.desafios.map(d => `<li style="padding:4px 0;font-size:0.9rem;">📌 ${d}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="card">
                <div style="font-weight:600;color:#0A2540;">📋 Recomendações</div>
                <ul style="list-style:none;padding:0;margin-top:8px;">
                    ${insights.recomendacoes.map(r => `<li style="padding:4px 0;font-size:0.9rem;">🎯 ${r}</li>`).join('')}
                </ul>
            </div>
        </div>
`;

        // ============================================
        // PDI
        // ============================================
        html += `
        <div class="section">
            <h2 class="section-title"><span class="num">7</span> Plano de Desenvolvimento (PDI)</h2>
            <div class="card">
                <div style="font-weight:600;color:#0A2540;">📋 Diagnóstico</div>
                <div class="text" style="margin-top:8px;">${pdi.diagnostico}</div>
            </div>
            <div class="grid-3">
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">📅 Curto Prazo</div>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        ${pdi.objetivos.curto_prazo.map(o => `<li style="padding:4px 0;font-size:0.9rem;">✅ ${o}</li>`).join('')}
                    </ul>
                </div>
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">📅 Médio Prazo</div>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        ${pdi.objetivos.medio_prazo.map(o => `<li style="padding:4px 0;font-size:0.9rem;">✅ ${o}</li>`).join('')}
                    </ul>
                </div>
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">📅 Longo Prazo</div>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        ${pdi.objetivos.longo_prazo.map(o => `<li style="padding:4px 0;font-size:0.9rem;">✅ ${o}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="grid-2">
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">📚 Recomendações</div>
                    <div style="margin-top:8px;">
                        <div style="font-size:0.85rem;color:#64748B;"><strong>Livros:</strong> ${pdi.recomendacoes.livros.join(', ')}</div>
                        <div style="font-size:0.85rem;color:#64748B;margin-top:4px;"><strong>Cursos:</strong> ${pdi.recomendacoes.cursos.join(', ')}</div>
                        <div style="font-size:0.85rem;color:#64748B;margin-top:4px;"><strong>Podcasts:</strong> ${pdi.recomendacoes.podcasts.join(', ')}</div>
                    </div>
                </div>
                <div class="card">
                    <div style="font-weight:600;color:#0A2540;">🏋️ Exercícios</div>
                    <ul style="list-style:none;padding:0;margin-top:8px;">
                        ${pdi.recomendacoes.exercicios.map(e => `<li style="padding:4px 0;font-size:0.9rem;">✅ ${e}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div style="margin-top:12px;">
                <div style="font-weight:600;color:#0A2540;">📆 Plano 30/60/90/180/365</div>
                <div class="grid-3">
                    ${pdi.plano_30_60_90_180_365.map(p => `
                    <div class="card">
                        <div style="font-weight:700;color:#D97706;">${p.periodo}</div>
                        <div style="font-weight:600;font-size:0.9rem;">${p.titulo}</div>
                        <div style="font-size:0.8rem;color:#64748B;margin-top:4px;">${p.acoes}</div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
`;

        // ============================================
        // PARECER FINAL E MENSAGEM
        // ============================================
        html += `
        <div class="section">
            <h2 class="section-title"><span class="num">8</span> Parecer Final</h2>
            <div class="card" style="background:#FEF3C7;border-color:#D97706;">
                <div class="text">${laudo.parecer_final}</div>
            </div>
            <div class="card" style="background:#F8FAFC;border-color:#10B981;margin-top:12px;">
                <div style="font-size:1.2rem;font-weight:700;color:#D97706;">🌟 Mensagem da IA</div>
                <div class="text" style="font-style:italic;margin-top:8px;">${laudo.mensagem_motivacional}</div>
            </div>
        </div>
`;

        // ============================================
        // ASSINATURA
        // ============================================
        html += `
        <div class="footer">
            <div style="font-weight:700;font-size:0.9rem;">VIGORRE ONE™ · People Analytics Enterprise</div>
            <div style="margin-top:4px;">Gerado automaticamente pela VIGOR AI™ · Metodologia Exclusiva VIGOR®</div>
            <div style="margin-top:8px;font-size:0.7rem;color:#94A3B8;">Hash: ${laudo.cabecalho.participante}_${laudo.cabecalho.data}_${Date.now()}</div>
            <div style="margin-top:4px;">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir</button>
            </div>
        </div>
    </div>
</body>
</html>`;

        return html;
    }
}

if (typeof window !== 'undefined') {
    window.GeradorLaudo = GeradorLaudo;
    console.log('📋 Gerador de Laudo carregado com sucesso!');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeradorLaudo;
}
