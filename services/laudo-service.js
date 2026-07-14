/**
 * ============================================
 * VIGORRE ONE™ - LAUDO SERVICE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 14/07/2026
 * 
 * FUNCIONALIDADES:
 * - Gerar laudo comportamental
 * - Buscar laudo por ID
 * - Listar laudos
 * - Exportar para PDF
 * - Validar laudo
 * - Assinar digitalmente
 * - Histórico de laudos
 * ============================================
 */

'use strict';

// ============================================
// CONFIGURAÇÃO
// ============================================
const LAUDO_CONFIG = {
    tipos: ['comportamental', 'executivo', 'tecnico'],
    status: ['rascunho', 'finalizado', 'assinado', 'entregue'],
    storageKey: 'vigorre_laudos',
    version: '1.0.0'
};

// ============================================
// CLASSE LAUDO SERVICE
// ============================================
class LaudoService {
    
    // ============================================
    // CONSTRUTOR
    // ============================================
    constructor() {
        this.config = LAUDO_CONFIG;
    }

    // ============================================
    // 1. GERAR LAUDO COMPORTAMENTAL
    // ============================================
    gerarLaudo(dados) {
        try {
            if (!dados || !dados.participantId) {
                return { success: false, error: 'Dados do participante são obrigatórios' };
            }

            // Validar dados mínimos
            if (!dados.disc && !dados.ie && !dados.valores) {
                return { success: false, error: 'Pelo menos um teste é necessário para gerar o laudo' };
            }

            var laudo = {
                id: this._gerarId(),
                tipo: 'comportamental',
                participantId: dados.participantId,
                participantName: dados.participantName || 'Participante',
                companyId: dados.companyId || null,
                companyName: dados.companyName || '',
                dados: {
                    disc: dados.disc || {},
                    ie: dados.ie || {},
                    valores: dados.valores || {},
                    swot: dados.swot || {},
                    bigfive: dados.bigfive || {},
                    competencias: dados.competencias || {},
                    lideranca: dados.lideranca || {},
                    potencial: dados.potencial || {},
                    fitcultural: dados.fitcultural || {}
                },
                analise: this._gerarAnaliseCompleta(dados),
                recomendacoes: this._gerarRecomendacoesCompletas(dados),
                planoDesenvolvimento: this._gerarPlanoDesenvolvimentoCompleto(dados),
                status: 'rascunho',
                version: this.config.version,
                codigoValidacao: this._gerarCodigoValidacao(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this._salvar(laudo);

            return {
                success: true,
                data: laudo,
                message: 'Laudo gerado com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao gerar laudo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 2. BUSCAR POR ID
    // ============================================
    buscarPorId(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var laudos = this._getAll();
            for (var i = 0; i < laudos.length; i++) {
                if (laudos[i].id === id) {
                    return { success: true, data: laudos[i] };
                }
            }

            return { success: false, error: 'Laudo não encontrado' };

        } catch (error) {
            console.error('❌ Erro ao buscar laudo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 3. LISTAR LAUDOS
    // ============================================
    listar(filtros) {
        try {
            var laudos = this._getAll();

            if (filtros) {
                if (filtros.status) {
                    laudos = laudos.filter(function(l) { return l.status === filtros.status; });
                }
                if (filtros.participantId) {
                    laudos = laudos.filter(function(l) { return l.participantId === filtros.participantId; });
                }
                if (filtros.companyId) {
                    laudos = laudos.filter(function(l) { return l.companyId === filtros.companyId; });
                }
                if (filtros.search) {
                    var search = filtros.search.toLowerCase();
                    laudos = laudos.filter(function(l) {
                        return (l.participantName || '').toLowerCase().includes(search) ||
                               (l.companyName || '').toLowerCase().includes(search) ||
                               (l.id || '').toLowerCase().includes(search);
                    });
                }
            }

            laudos.sort(function(a, b) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            return {
                success: true,
                data: laudos,
                total: laudos.length
            };

        } catch (error) {
            console.error('❌ Erro ao listar laudos:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 4. ATUALIZAR STATUS
    // ============================================
    atualizarStatus(id, status) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (this.config.status.indexOf(status) === -1) {
                return { success: false, error: 'Status inválido' };
            }

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var laudo = result.data;
            laudo.status = status;
            laudo.updatedAt = new Date().toISOString();

            if (status === 'finalizado' || status === 'assinado') {
                laudo.dataFinalizacao = new Date().toISOString();
            }

            if (status === 'entregue') {
                laudo.dataEntrega = new Date().toISOString();
            }

            this._atualizar(laudo);

            return {
                success: true,
                data: laudo,
                message: 'Status atualizado para: ' + status
            };

        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 5. ASSINAR DIGITALMENTE
    // ============================================
    assinar(id, assinatura) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            if (!assinatura || !assinatura.nome) {
                return { success: false, error: 'Dados de assinatura são obrigatórios' };
            }

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var laudo = result.data;

            if (laudo.status === 'assinado') {
                return { success: false, error: 'Laudo já está assinado' };
            }

            laudo.assinatura = {
                nome: assinatura.nome,
                cargo: assinatura.cargo || '',
                data: new Date().toISOString(),
                ip: assinatura.ip || '127.0.0.1',
                hash: this._gerarHash(id + assinatura.nome + Date.now())
            };

            laudo.status = 'assinado';
            laudo.updatedAt = new Date().toISOString();

            this._atualizar(laudo);

            return {
                success: true,
                data: laudo,
                message: 'Laudo assinado digitalmente'
            };

        } catch (error) {
            console.error('❌ Erro ao assinar laudo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 6. VALIDAR LAUDO
    // ============================================
    validar(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var laudo = result.data;

            var validacao = {
                valido: true,
                erros: [],
                avisos: []
            };

            // Verificar dados mínimos
            if (!laudo.dados.disc || Object.keys(laudo.dados.disc).length === 0) {
                validacao.erros.push('Dados DISC não encontrados');
                validacao.valido = false;
            }

            if (!laudo.dados.ie || Object.keys(laudo.dados.ie).length === 0) {
                validacao.avisos.push('Dados IE não encontrados');
            }

            if (!laudo.dados.valores || Object.keys(laudo.dados.valores).length === 0) {
                validacao.avisos.push('Dados Valores não encontrados');
            }

            // Verificar status
            if (laudo.status === 'rascunho') {
                validacao.avisos.push('Laudo está em rascunho');
            }

            return {
                success: true,
                data: validacao,
                message: validacao.valido ? 'Laudo válido' : 'Laudo com problemas'
            };

        } catch (error) {
            console.error('❌ Erro ao validar laudo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 7. EXPORTAR PARA PDF
    // ============================================
    exportarPDF(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var result = this.buscarPorId(id);
            if (!result.success) return result;

            var laudo = result.data;

            var html = this._gerarHTMLLaudo(laudo);

            return {
                success: true,
                data: {
                    html: html,
                    filename: 'laudo_' + laudo.id + '.pdf'
                },
                message: 'PDF gerado com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao exportar PDF:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 8. EXCLUIR LAUDO
    // ============================================
    excluir(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };

            var laudos = this._getAll();
            var filtered = laudos.filter(function(l) { return l.id !== id; });

            if (filtered.length === laudos.length) {
                return { success: false, error: 'Laudo não encontrado' };
            }

            localStorage.setItem(this.config.storageKey, JSON.stringify(filtered));

            return {
                success: true,
                message: 'Laudo excluído com sucesso'
            };

        } catch (error) {
            console.error('❌ Erro ao excluir laudo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 9. MÉTODOS PRIVADOS
    // ============================================

    _gerarId() {
        return 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    _getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.config.storageKey) || '[]');
        } catch {
            return [];
        }
    }

    _salvar(laudo) {
        var laudos = this._getAll();
        laudos.push(laudo);
        localStorage.setItem(this.config.storageKey, JSON.stringify(laudos));
    }

    _atualizar(laudo) {
        var laudos = this._getAll();
        for (var i = 0; i < laudos.length; i++) {
            if (laudos[i].id === laudo.id) {
                laudos[i] = laudo;
                break;
            }
        }
        localStorage.setItem(this.config.storageKey, JSON.stringify(laudos));
    }

    _gerarCodigoValidacao() {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = 'VIG-';
        for (var i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code += '-' + new Date().getFullYear();
        return code;
    }

    _gerarHash(texto) {
        // Simulação de hash (em produção usar crypto)
        return 'hash_' + texto.slice(0, 10) + '_' + Date.now().toString(36);
    }

    _gerarAnaliseCompleta(dados) {
        var analise = {
            perfilComportamental: this._analisarPerfil(dados.disc || {}),
            inteligenciaEmocional: this._analisarIE(dados.ie || {}),
            valores: this._analisarValores(dados.valores || {}),
            swot: this._analisarSWOT(dados.swot || {}),
            bigfive: this._analisarBigFive(dados.bigfive || {})
        };
        return analise;
    }

    _analisarPerfil(disc) {
        var dominant = disc.dominant || 'D';
        var dominantNames = {
            'D': 'Dominância',
            'I': 'Influência',
            'S': 'Estabilidade',
            'C': 'Conformidade'
        };
        return {
            tipo: dominantNames[dominant] || dominant,
            descricao: 'Perfil com predominância em ' + (dominantNames[dominant] || dominant),
            forcas: ['Determinação', 'Foco em resultados', 'Iniciativa'],
            oportunidades: ['Paciência', 'Escuta ativa', 'Trabalho em equipe']
        };
    }

    _analisarIE(ie) {
        var overall = ie.overallPercentage || 0;
        var nivel = overall >= 80 ? 'Excelente' :
                    overall >= 60 ? 'Bom' :
                    overall >= 40 ? 'Médio' : 'Em desenvolvimento';
        return {
            nivel: nivel,
            pontuacao: overall,
            dimensoes: {
                autoconsciencia: ie.selfAwareness || 0,
                autorregulacao: ie.selfRegulation || 0,
                motivacao: ie.motivation || 0,
                empatia: ie.empathy || 0,
                habilidadesSociais: ie.socialSkills || 0
            }
        };
    }

    _analisarValores(valores) {
        var principais = valores.principais || [];
        return {
            principais: principais.length > 0 ? principais : ['Não identificado'],
            descricao: 'Valores alinhados com o propósito organizacional'
        };
    }

    _analisarSWOT(swot) {
        return {
            forcas: swot.forcas || ['Não identificado'],
            fraquezas: swot.fraquezas || ['Não identificado'],
            oportunidades: swot.oportunidades || ['Não identificado'],
            ameacas: swot.ameacas || ['Não identificado']
        };
    }

    _analisarBigFive(bigfive) {
        return {
            abertura: bigfive.abertura || 0,
            conscienciosidade: bigfive.conscienciosidade || 0,
            extroversao: bigfive.extroversao || 0,
            amabilidade: bigfive.amabilidade || 0,
            neuroticismo: bigfive.neuroticismo || 0
        };
    }

    _gerarRecomendacoesCompletas(dados) {
        return [
            'Desenvolver autoconsciência através de feedbacks regulares',
            'Aprimorar habilidades de comunicação em equipe',
            'Fortalecer a inteligência emocional em situações de pressão',
            'Investir em desenvolvimento de liderança',
            'Buscar mentoria para crescimento profissional'
        ];
    }

    _gerarPlanoDesenvolvimentoCompleto(dados) {
        return {
            objetivos: [
                'Desenvolver habilidades de liderança',
                'Aprimorar inteligência emocional',
                'Fortalecer competências técnicas'
            ],
            acoes: [
                'Participar de programa de mentoria',
                'Realizar treinamentos específicos',
                'Buscar projetos desafiadores',
                'Praticar feedback regular'
            ],
            prazos: [
                '3 meses - Avaliação de progresso',
                '6 meses - Revisão de objetivos',
                '12 meses - Avaliação final'
            ],
            metricas: [
                'Avaliação 360°',
                'Feedback de pares',
                'Resultados de projetos'
            ]
        };
    }

    _gerarHTMLLaudo(laudo) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Laudo Comportamental - VIGORRE ONE™</title>
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 40px; color: #0F172A; }
                    .header { text-align: center; border-bottom: 3px solid #D97706; padding-bottom: 20px; }
                    .logo { font-size: 28px; font-weight: 700; color: #0A2540; }
                    .logo span { color: #D97706; }
                    .subtitle { color: #64748B; font-size: 16px; margin-top: 4px; }
                    .laudo-number { font-size: 14px; color: #94A3B8; margin-top: 8px; }
                    .content { margin-top: 30px; }
                    .section { margin-bottom: 30px; page-break-inside: avoid; }
                    .section-title { font-size: 18px; font-weight: 600; color: #1D4ED8; border-bottom: 2px solid #D97706; padding-bottom: 8px; margin-bottom: 15px; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .card { background: #F8FAFC; padding: 20px; border-radius: 8px; border: 1px solid #E2E8F0; }
                    .footer { margin-top: 40px; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; font-size: 12px; color: #94A3B8; }
                    .page-break { page-break-before: always; }
                    .seal { text-align: center; padding: 20px; }
                    .signature { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; }
                    .signature .line { display: inline-block; width: 200px; border-bottom: 1px solid #0A2540; margin-top: 20px; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
                    .badge-success { background: #D1FAE5; color: #065F46; }
                    .badge-warning { background: #FEF3C7; color: #92400E; }
                    .status { display: inline-block; padding: 4px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: uppercase; }
                    .status-rascunho { background: #FEF3C7; color: #92400E; }
                    .status-finalizado { background: #DBEAFE; color: #1E40AF; }
                    .status-assinado { background: #D1FAE5; color: #065F46; }
                    .status-entregue { background: #ECFDF5; color: #065F46; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">VIGORRE ONE<span>®</span></div>
                    <div class="subtitle">Laudo Comportamental Integrado</div>
                    <div class="laudo-number">Laudo nº ${laudo.codigoValidacao}</div>
                    <div style="font-size:12px;color:#94A3B8;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div>
                    <div style="margin-top:10px;">
                        <span class="status status-${laudo.status}">${laudo.status.toUpperCase()}</span>
                    </div>
                </div>

                <div class="content">
                    <div class="section">
                        <div style="text-align:center;padding:20px 0;">
                            <h2>Laudo Comportamental</h2>
                            <p style="color:#64748B;font-size:18px;">${laudo.participantName || 'Participante'}</p>
                            <p style="color:#94A3B8;">${laudo.companyName || '--'}</p>
                        </div>
                    </div>

                    <div class="page-break"></div>

                    <div class="section">
                        <div class="section-title">📊 Perfil Comportamental</div>
                        ${this._gerarCardPerfil(laudo.dados.disc)}
                    </div>

                    <div class="page-break"></div>

                    <div class="section">
                        <div class="section-title">🧠 Inteligência Emocional</div>
                        ${this._gerarCardIE(laudo.dados.ie)}
                    </div>

                    <div class="page-break"></div>

                    <div class="section">
                        <div class="section-title">💎 Valores Pessoais</div>
                        ${this._gerarCardValores(laudo.dados.valores)}
                    </div>

                    <div class="page-break"></div>

                    <div class="section">
                        <div class="section-title">📋 Recomendações</div>
                        <div class="card">
                            <ul style="list-style-type:none;padding:0;">
                                ${(laudo.recomendacoes || []).map(function(r) {
                                    return '<li style="padding:8px 0;border-bottom:1px solid #E2E8F0;">✅ ' + r + '</li>';
                                }).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="seal">
                        <div style="font-size:40px;margin:20px 0;">🔲</div>
                        <p style="font-size:12px;color:#94A3B8;">QR Code de Validação</p>
                        <p style="font-size:10px;color:#94A3B8;">Código: ${laudo.codigoValidacao}</p>
                    </div>

                    ${laudo.assinatura ? this._gerarAssinatura(laudo.assinatura) : ''}
                </div>

                <div class="footer">
                    <p>VIGORRE ONE™ - People Intelligence Enterprise</p>
                    <p>Documento gerado em ${new Date().toLocaleString('pt-BR')} | Versão ${laudo.version}</p>
                    <p>Código: ${laudo.codigoValidacao}</p>
                </div>
            </body>
            </html>
        `;
    }

    _gerarCardPerfil(disc) {
        var labels = ['D', 'I', 'S', 'C'];
        var values = [
            disc.D || 0,
            disc.I || 0,
            disc.S || 0,
            disc.C || 0
        ];
        var barHtml = '';
        var maxValue = Math.max.apply(null, values.concat([10]));
        for (var i = 0; i < labels.length; i++) {
            var percent = Math.round((values[i] / maxValue) * 100);
            barHtml += `
                <div style="margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;font-size:14px;">
                        <span><strong>${labels[i]}</strong></span>
                        <span>${values[i]}%</span>
                    </div>
                    <div style="background:#E2E8F0;border-radius:4px;height:8px;overflow:hidden;">
                        <div style="background:#1D4ED8;width:${percent}%;height:100%;border-radius:4px;"></div>
                    </div>
                </div>
            `;
        }
        return `<div class="card">${barHtml}</div>`;
    }

    _gerarCardIE(ie) {
        var dimensions = [
            { label: 'Autoconsciência', value: ie.selfAwareness || 0 },
            { label: 'Autorregulação', value: ie.selfRegulation || 0 },
            { label: 'Motivação', value: ie.motivation || 0 },
            { label: 'Empatia', value: ie.empathy || 0 },
            { label: 'Habilidades Sociais', value: ie.socialSkills || 0 }
        ];
        var radarHtml = '';
        for (var i = 0; i < dimensions.length; i++) {
            var d = dimensions[i];
            var percent = Math.min(d.value, 100);
            radarHtml += `
                <div style="margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;font-size:13px;">
                        <span>${d.label}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="background:#E2E8F0;border-radius:4px;height:6px;overflow:hidden;">
                        <div style="background:#7C3AED;width:${percent}%;height:100%;border-radius:4px;"></div>
                    </div>
                </div>
            `;
        }
        var overall = ie.overallPercentage || 0;
        var nivel = overall >= 80 ? 'Excelente' : overall >= 60 ? 'Bom' : overall >= 40 ? 'Médio' : 'Em desenvolvimento';
        return `
            <div class="card">
                ${radarHtml}
                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #E2E8F0;">
                    <p><strong>Nível:</strong> ${nivel} (${overall}%)</p>
                </div>
            </div>
        `;
    }

    _gerarCardValores(valores) {
        var principais = valores.principais || ['Não identificado'];
        return `
            <div class="card">
                <p><strong>Valores Principais:</strong></p>
                <ul style="list-style-type:none;padding:0;">
                    ${principais.map(function(v) {
                        return '<li style="padding:4px 0;">💎 ' + v + '</li>';
                    }).join('')}
                </ul>
            </div>
        `;
    }

    _gerarAssinatura(assinatura) {
        return `
            <div class="signature">
                <p style="font-size:14px;color:#0A2540;font-weight:600;">${assinatura.nome}</p>
                <p style="font-size:12px;color:#64748B;">${assinatura.cargo || 'Assinante'}</p>
                <div class="line"></div>
                <p style="font-size:11px;color:#94A3B8;margin-top:4px;">Assinado em: ${new Date(assinatura.data).toLocaleString('pt-BR')}</p>
                <p style="font-size:10px;color:#94A3B8;">Hash: ${assinatura.hash}</p>
            </div>
        `;
    }
}

// ============================================
// EXPORTAR
// ============================================
var laudoService = new LaudoService();
window.laudoService = laudoService;

console.log('✅ VIGORRE ONE™ - Laudo Service carregado com sucesso!');
console.log('📋 Status disponíveis:', LAUDO_CONFIG.status.join(', '));
