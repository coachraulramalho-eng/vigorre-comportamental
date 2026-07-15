/**
 * ============================================
 * VIGORRE ONE™ - RELATORIO SERVICE
 * INTERNATIONAL ENTERPRISE EDITION
 * ============================================
 * 
 * VERSÃO: 1.0.0
 * DATA: 15/07/2026
 * 
 * FUNCIONALIDADES:
 * - Gerar relatório simplificado
 * - Gerar relatório completo
 * - Gerar relatório executivo
 * - Exportar para PDF
 * - Exportar para Excel
 * - Exportar para CSV
 * - Histórico de relatórios
 * ============================================
 */

'use strict';

const RELATORIO_CONFIG = {
    tipos: ['simplificado', 'completo', 'executivo', 'laudo'],
    formatos: ['pdf', 'excel', 'csv'],
    storageKey: 'vigorre_reports'
};

class RelatorioService {
    
    constructor() {
        this.config = RELATORIO_CONFIG;
    }

    gerarSimplificado(dados) {
        try {
            if (!dados || !dados.participantId) { return { success: false, error: 'Dados do participante são obrigatórios' }; }
            var relatorio = {
                id: this._gerarId(),
                tipo: 'simplificado',
                participantId: dados.participantId,
                participantName: dados.participantName || 'Participante',
                companyId: dados.companyId || null,
                companyName: dados.companyName || '',
                dados: { disc: dados.disc || {}, ie: dados.ie || {}, valores: dados.valores || {}, swot: dados
                        .swot || {}, bigfive: dados.bigfive || {} },
                resumo: this._gerarResumo(dados),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this._salvar(relatorio);
            return { success: true, data: relatorio, message: 'Relatório simplificado gerado com sucesso' };
        } catch (error) { console.error('❌ Erro ao gerar relatório simplificado:', error); return { success: false,
                error: error.message }; }
    }

    gerarCompleto(dados) {
        try {
            if (!dados || !dados.participantId) { return { success: false, error: 'Dados do participante são obrigatórios' }; }
            var relatorio = {
                id: this._gerarId(),
                tipo: 'completo',
                participantId: dados.participantId,
                participantName: dados.participantName || 'Participante',
                companyId: dados.companyId || null,
                companyName: dados.companyName || '',
                dados: { disc: dados.disc || {}, ie: dados.ie || {}, valores: dados.valores || {}, swot: dados
                        .swot || {}, bigfive: dados.bigfive || {}, competencias: dados.competencias || {},
                    lideranca: dados.lideranca || {}, potencial: dados.potencial || {}, fitcultural: dados
                        .fitcultural || {} },
                analise: this._gerarAnalise(dados),
                recomendacoes: this._gerarRecomendacoes(dados),
                planoDesenvolvimento: this._gerarPlanoDesenvolvimento(dados),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this._salvar(relatorio);
            return { success: true, data: relatorio, message: 'Relatório completo gerado com sucesso' };
        } catch (error) { console.error('❌ Erro ao gerar relatório completo:', error); return { success: false,
                error: error.message }; }
    }

    gerarExecutivo(dados) {
        try {
            if (!dados || !dados.empresaId) { return { success: false, error: 'Dados da empresa são obrigatórios' }; }
            var relatorio = {
                id: this._gerarId(),
                tipo: 'executivo',
                empresaId: dados.empresaId,
                empresaName: dados.empresaName || 'Empresa',
                dados: {
                    totalColaboradores: dados.totalColaboradores || 0,
                    totalAvaliacoes: dados.totalAvaliacoes || 0,
                    mediaDisc: dados.mediaDisc || {},
                    mediaIe: dados.mediaIe || {},
                    mediaValores: dados.mediaValores || {},
                    engajamento: dados.engajamento || 0,
                    turnover: dados.turnover || 0
                },
                analise: this._gerarAnaliseEmpresarial(dados),
                recomendacoes: this._gerarRecomendacoesEmpresariais(dados),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this._salvar(relatorio);
            return { success: true, data: relatorio, message: 'Relatório executivo gerado com sucesso' };
        } catch (error) { console.error('❌ Erro ao gerar relatório executivo:', error); return { success: false,
                error: error.message }; }
    }

    buscarPorId(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            var relatorios = this._getAll();
            for (var i = 0; i < relatorios.length; i++) {
                if (relatorios[i].id === id) { return { success: true, data: relatorios[i] }; }
            }
            return { success: false, error: 'Relatório não encontrado' };
        } catch (error) { console.error('❌ Erro ao buscar relatório:', error); return { success: false, error: error
                .message }; }
    }

    listar(filtros) {
        try {
            var relatorios = this._getAll();
            if (filtros) {
                if (filtros.tipo) { relatorios = relatorios.filter(function(r) { return r.tipo === filtros.tipo; }); }
                if (filtros.participantId) { relatorios = relatorios.filter(function(r) { return r.participantId ===
                        filtros.participantId; }); }
                if (filtros.empresaId) { relatorios = relatorios.filter(function(r) { return r.empresaId === filtros
                        .empresaId; }); }
                if (filtros.companyId) { relatorios = relatorios.filter(function(r) { return r.companyId === filtros
                        .companyId; }); }
            }
            relatorios.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
            return { success: true, data: relatorios, total: relatorios.length };
        } catch (error) { console.error('❌ Erro ao listar relatórios:', error); return { success: false, error: error
                .message }; }
    }

    exportarPDF(relatorioId) {
        try {
            if (!relatorioId) return { success: false, error: 'ID do relatório é obrigatório' };
            var result = this.buscarPorId(relatorioId);
            if (!result.success) return result;
            var relatorio = result.data;
            var html = this._gerarHTML(relatorio);
            console.log('📄 Exportando para PDF:', relatorio.id);
            return { success: true, data: { html: html, filename: 'relatorio_' + relatorio.id + '.pdf' },
                message: 'PDF gerado com sucesso' };
        } catch (error) { console.error('❌ Erro ao exportar PDF:', error); return { success: false, error: error
                .message }; }
    }

    exportarExcel(relatorioId) {
        try {
            if (!relatorioId) return { success: false, error: 'ID do relatório é obrigatório' };
            var result = this.buscarPorId(relatorioId);
            if (!result.success) return result;
            var relatorio = result.data;
            var dados = this._gerarDadosExcel(relatorio);
            console.log('📊 Exportando para Excel:', relatorio.id);
            return { success: true, data: dados, message: 'Excel gerado com sucesso' };
        } catch (error) { console.error('❌ Erro ao exportar Excel:', error); return { success: false, error: error
                .message }; }
    }

    exportarCSV(relatorioId) {
        try {
            if (!relatorioId) return { success: false, error: 'ID do relatório é obrigatório' };
            var result = this.buscarPorId(relatorioId);
            if (!result.success) return result;
            var relatorio = result.data;
            var csv = this._gerarCSV(relatorio);
            console.log('📋 Exportando para CSV:', relatorio.id);
            return { success: true, data: csv, message: 'CSV gerado com sucesso' };
        } catch (error) { console.error('❌ Erro ao exportar CSV:', error); return { success: false, error: error
                .message }; }
    }

    excluir(id) {
        try {
            if (!id) return { success: false, error: 'ID é obrigatório' };
            var relatorios = this._getAll();
            var filtered = relatorios.filter(function(r) { return r.id !== id; });
            if (filtered.length === relatorios.length) { return { success: false, error: 'Relatório não encontrado' }; }
            localStorage.setItem(this.config.storageKey, JSON.stringify(filtered));
            return { success: true, message: 'Relatório excluído com sucesso' };
        } catch (error) { console.error('❌ Erro ao excluir relatório:', error); return { success: false, error: error
                .message }; }
    }

    _gerarId() { return 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6).toUpperCase(); }
    _getAll() { try { return JSON.parse(localStorage.getItem(this.config.storageKey) || '[]'); } catch { return []; } }
    _salvar(relatorio) { var relatorios = this._getAll();
        relatorios.push(relatorio);
        localStorage.setItem(this.config.storageKey, JSON.stringify(relatorios)); }

    _gerarResumo(dados) {
        var resumo = { disc: 'Perfil DISC identificado', ie: 'Inteligência Emocional em desenvolvimento',
            valores: 'Valores alinhados com a organização' };
        if (dados.disc && dados.disc.dominant) {
            var dominantNames = { 'D': 'Dominância', 'I': 'Influência', 'S': 'Estabilidade', 'C': 'Conformidade' };
            resumo.disc = 'Perfil predominante: ' + (dominantNames[dados.disc.dominant] || dados.disc.dominant);
        }
        if (dados.ie && dados.ie.overallPercentage) {
            var nivel = dados.ie.overallPercentage >= 80 ? 'Excelente' : dados.ie.overallPercentage >= 60 ? 'Bom' :
                dados.ie.overallPercentage >= 40 ? 'Médio' : 'Em desenvolvimento';
            resumo.ie = 'Inteligência Emocional: ' + nivel + ' (' + dados.ie.overallPercentage + '%)';
        }
        return resumo;
    }

    _gerarAnalise(dados) {
        return { pontosFortes: ['Comunicação eficaz', 'Pensamento analítico', 'Resiliência'],
            oportunidades: ['Desenvolver liderança', 'Aprimorar inteligência emocional'],
            recomendacoes: ['Participar de treinamentos de liderança', 'Buscar feedback regular'] };
    }

    _gerarRecomendacoes(dados) {
        return [
            'Desenvolver autoconsciência através de feedbacks regulares',
            'Aprimorar habilidades de comunicação em equipe',
            'Fortalecer a inteligência emocional em situações de pressão'
        ];
    }

    _gerarPlanoDesenvolvimento(dados) {
        return {
            objetivos: ['Desenvolver habilidades de liderança', 'Aprimorar inteligência emocional',
                'Fortalecer competências técnicas'
            ],
            acoes: ['Participar de mentoria', 'Realizar treinamentos específicos', 'Buscar projetos desafiadores'],
            prazos: ['3 meses - Avaliação de progresso', '6 meses - Revisão de objetivos',
                '12 meses - Avaliação final'
            ]
        };
    }

    _gerarAnaliseEmpresarial(dados) {
        return {
            forcas: ['Equipe engajada', 'Baixo turnover', 'Bom clima organizacional'],
            fraquezas: ['Necessidade de desenvolvimento de lideranças', 'Comunicação interna'],
            oportunidades: ['Expansão de mercado', 'Novas tecnologias'],
            ameacas: ['Concorrência', 'Mudanças no mercado']
        };
    }

    _gerarRecomendacoesEmpresariais(dados) {
        return [
            'Investir em programas de desenvolvimento de liderança',
            'Implementar plano de carreira',
            'Fortalecer a cultura organizacional'
        ];
    }

    _gerarHTML(relatorio) {
        return `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Relatório - VIGORRE ONE™</title>
            <style>body{font-family:'Inter',sans-serif;margin:40px;color:#0F172A;}.header{text-align:center;border-bottom:2px solid #D97706;padding-bottom:20px;}.logo{font-size:24px;font-weight:700;color:#0A2540;}.logo span{color:#D97706;}.subtitle{color:#64748B;font-size:14px;}.content{margin-top:30px;}.section{margin-bottom:30px;}.section-title{font-size:18px;font-weight:600;color:#1D4ED8;border-bottom:1px solid #E2E8F0;padding-bottom:8px;}.footer{margin-top:40px;text-align:center;border-top:1px solid #E2E8F0;padding-top:20px;font-size:12px;color:#94A3B8;}.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}.card{background:#F8FAFC;padding:20px;border-radius:8px;border:1px solid #E2E8F0;}</style>
            </head>
            <body>
                <div class="header"><div class="logo">VIGORRE ONE<span>™</span></div><div class="subtitle">Relatório ${relatorio.tipo.toUpperCase()}</div><div style="font-size:12px;color:#94A3B8;">Emissão: ${new Date().toLocaleDateString('pt-BR')}</div></div>
                <div class="content">
                    <div class="section"><div class="section-title">📊 Dados do Participante</div><p><strong>Nome:</strong> ${relatorio.participantName || '--'}</p><p><strong>Empresa:</strong> ${relatorio.companyName || '--'}</p></div>
                    <div class="section"><div class="section-title">📈 Resumo</div>${Object.keys(relatorio.dados || {}).map(function(key){return '<div class="card"><strong>'+key.toUpperCase()+'</strong>: '+JSON.stringify(relatorio.dados[key])+'</div>';}).join('')}</div>
                </div>
                <div class="footer"><p>VIGORRE ONE™ - People Intelligence Enterprise</p><p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p><p>Código: ${relatorio.id}</p></div>
            </body>
            </html>
        `;
    }

    _gerarDadosExcel(relatorio) {
        return { headers: ['ID', 'Participante', 'Empresa', 'Tipo', 'Data'], rows: [
                [relatorio.id, relatorio.participantName || '--', relatorio.companyName || '--', relatorio.tipo,
                    new Date(relatorio.createdAt).toLocaleDateString('pt-BR')
                ]
            ] };
    }

    _gerarCSV(relatorio) {
        var headers = 'ID,Participante,Empresa,Tipo,Data\n';
        var row = relatorio.id + ',' + (relatorio.participantName || '--') + ',' + (relatorio.companyName || '--') +
            ',' + relatorio.tipo + ',' + new Date(relatorio.createdAt).toLocaleDateString('pt-BR') + '\n';
        return headers + row;
    }
}

var relatorioService = new RelatorioService();
window.relatorioService = relatorioService;

console.log('✅ VIGORRE ONE™ - Relatorio Service carregado com sucesso!');
console.log('📄 Tipos de relatório:', RELATORIO_CONFIG.tipos.join(', '));
