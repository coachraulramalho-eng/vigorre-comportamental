// Controlador de testes - Sessão Única com LGPD

import { supabase } from '../supabase-config.js';

class TesteController {
    constructor(config) {
        this.tipo = config.tipo;
        this.perguntas = config.perguntas;
        this.totalPerguntas = config.totalPerguntas;
        this.tempoLimite = config.tempoLimite * 60; // segundos
        
        this.indiceAtual = 0;
        this.respostas = [];
        this.timer = null;
        this.tempoRestante = this.tempoLimite;
        this.testeAtivo = false;
        this.participanteId = null;
        
        this.frases = [
            'Respire fundo. Você tem todo o tempo do mundo.',
            'Vai com calma. Cada resposta é um passo no seu autoconhecimento.',
            'Não existe resposta errada. Apenas confie em você.',
            'Você está indo muito bem. Continue no seu ritmo.',
            'Quase lá! Mais algumas perguntas e você terá insights incríveis.',
            'Parabéns! Você está quase concluindo sua avaliação.'
        ];
        this.fraseAtual = 0;
    }

    // ===== INICIAR TESTE =====
    iniciar() {
        // Verifica consentimento LGPD
        const consentimento = document.getElementById('consentimento-lgpd');
        if (!consentimento || !consentimento.checked) {
            alert('⚠️ Você precisa aceitar os termos LGPD para realizar o teste.');
            return;
        }

        this.participanteId = window.participanteId || localStorage.getItem('participanteId');
        if (!this.participanteId) {
            alert('⚠️ Participante não identificado. Faça login novamente.');
            return;
        }

        this.testeAtivo = true;
        this.indiceAtual = 0;
        this.respostas = [];
        this.tempoRestante = this.tempoLimite;

        // Esconde introdução, mostra perguntas
        document.getElementById('teste-intro').style.display = 'none';
        document.getElementById('teste-questoes').style.display = 'block';
        document.getElementById('teste-conclusao').style.display = 'none';

        // Inicia timer
        this.iniciarTimer();

        // Inicia frases motivacionais
        this.iniciarFrases();

        // Mostra primeira pergunta
        this.mostrarPergunta(0);
    }

    // ===== MOSTRAR PERGUNTA =====
    mostrarPergunta(index) {
        if (index >= this.totalPerguntas) {
            this.finalizarTeste();
            return;
        }

        const pergunta = this.perguntas[index];
        const questaoAtual = document.getElementById('questao-atual');
        const questaoEnunciado = document.getElementById('questao-enunciado');
        const opcaoA = document.getElementById('opcao-a');
        const opcaoB = document.getElementById('opcao-b');

        if (questaoAtual) questaoAtual.textContent = index + 1;
        if (questaoEnunciado) questaoEnunciado.textContent = pergunta.enunciado;
        if (opcaoA) opcaoA.textContent = pergunta.opcaoA;
        if (opcaoB) opcaoB.textContent = pergunta.opcaoB;

        // Atualiza progresso
        const progresso = ((index) / this.totalPerguntas) * 100;
        document.getElementById('progresso-bar').style.width = `${progresso}%`;
        
        // Reseta seleção dos botões
        document.querySelectorAll('.opcao-btn').forEach(btn => {
            btn.classList.remove('selecionado-more', 'selecionado-less');
        });

        // Habilita botões
        document.querySelectorAll('.opcao-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    // ===== SALVAR RESPOSTA =====
    salvarResposta(opcao, tipo) {
        if (!this.testeAtivo) return;

        // Salva resposta
        this.respostas.push({
            opcao: opcao,
            tipo: tipo // 'more' ou 'less'
        });

        this.indiceAtual++;

        // Troca frase a cada 2 perguntas
        if (this.indiceAtual % 2 === 0) {
            this.proximaFrase();
        }

        // Vai para próxima pergunta
        this.mostrarPergunta(this.indiceAtual);
    }

    // ===== FINALIZAR TESTE =====
    async finalizarTeste() {
        this.testeAtivo = false;
        this.pararTimer();
        this.pararFrases();

        // Atualiza progresso para 100%
        document.getElementById('progresso-bar').style.width = '100%';

        // Mostra conclusão
        document.getElementById('teste-questoes').style.display = 'none';
        document.getElementById('teste-conclusao').style.display = 'block';

        // Envia resultados
        await this.enviarResultados();

        // Mostra resultado simples
        this.mostrarResultadoSimples();
    }

    // ===== ENVIAR RESULTADOS =====
    async enviarResultados() {
        try {
            const response = await fetch('/api/avaliacao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participanteId: this.participanteId,
                    tipo: this.tipo,
                    respostas: this.respostas
                })
            });

            const result = await response.json();
            if (result.success) {
                window.resultadoId = result.data.id;
                return result.data;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erro ao enviar resultados:', error);
            alert('Erro ao enviar resultados. Tente novamente.');
        }
    }

    // ===== MOSTRAR RESULTADO SIMPLES =====
    mostrarResultadoSimples() {
        const container = document.getElementById('resultado-simples');
        // Exemplo - será preenchido com dados reais
        container.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 8px;">🔴🟡🟢🔵</div>
            <div style="font-weight: 700; font-size: 1.2rem; color: #D97706;">Dominância</div>
            <div style="color: #64748B;">Orientado a resultados, direto e competitivo</div>
        `;
    }

    // ===== GERAR RELATÓRIO =====
    async gerarRelatorio() {
        try {
            const response = await fetch('/api/relatorio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participanteId: this.participanteId,
                    tipo: this.tipo
                })
            });
            const result = await response.json();
            if (result.success) {
                window.location.href = `/relatorios/${this.tipo}/${result.data.id}`;
            }
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
        }
    }

    // ===== GERAR LAUDO =====
    async gerarLaudo() {
        try {
            const response = await fetch('/api/laudo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participanteId: this.participanteId
                })
            });
            const result = await response.json();
            if (result.success) {
                window.location.href = `/laudos/${result.data.id}`;
            }
        } catch (error) {
            console.error('Erro ao gerar laudo:', error);
        }
    }

    // ===== TIMER =====
    iniciarTimer() {
        this.timer = setInterval(() => {
            this.tempoRestante--;
            this.atualizarTimer();

            if (this.tempoRestante <= 0) {
                clearInterval(this.timer);
                alert('⏰ Tempo esgotado!');
                this.finalizarTeste();
            }
        }, 1000);
    }

    pararTimer() {
        clearInterval(this.timer);
        this.timer = null;
    }

    atualizarTimer() {
        const minutos = Math.floor(this.tempoRestante / 60);
        const segundos = this.tempoRestante % 60;
        const timerEl = document.getElementById('teste-timer');
        if (timerEl) {
            timerEl.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        }
    }

    // ===== FRASES MOTIVACIONAIS =====
    iniciarFrases() {
        this.fraseAtual = 0;
        this.mostrarFrase();
        this.intervaloFrases = setInterval(() => {
            this.proximaFrase();
        }, 15000);
    }

    pararFrases() {
        clearInterval(this.intervaloFrases);
    }

    mostrarFrase() {
        const fraseEl = document.getElementById('frase-motivacional');
        if (fraseEl) {
            fraseEl.textContent = `"${this.frases[this.fraseAtual]}"`;
        }
    }

    proximaFrase() {
        this.fraseAtual = (this.fraseAtual + 1) % this.frases.length;
        this.mostrarFrase();
    }
}

export default TesteController;
