// ============================================
// TESTE CONTROLLER - VIGORRE ONE™
// Controlador de testes com sessão única e LGPD
// ============================================

class TesteController {
    constructor(config) {
        this.tipo = config.tipo || 'disc';
        this.perguntas = config.perguntas || [];
        this.totalPerguntas = config.totalPerguntas || 0;
        this.tempoLimite = (config.tempoLimite || 5) * 60; // segundos
        this.participanteId = config.participanteId || null;

        this.indiceAtual = 0;
        this.respostas = [];
        this.timer = null;
        this.tempoRestante = this.tempoLimite;
        this.testeAtivo = false;
        this.intervaloFrases = null;
        this.fraseAtual = 0;

        this.frases = [
            'Respire fundo. Você tem todo o tempo do mundo.',
            'Vai com calma. Cada resposta é um passo no seu autoconhecimento.',
            'Não existe resposta errada. Apenas confie em você.',
            'Você está indo muito bem. Continue no seu ritmo.',
            'Quase lá! Mais algumas perguntas e você terá insights incríveis.',
            'Parabéns! Você está quase concluindo sua avaliação.',
            'Confie em sua primeira impressão. Ela é a mais autêntica.',
            'Cada resposta sua é valiosa para seu desenvolvimento.'
        ];
    }

    // ============================================
    // INICIAR TESTE
    // ============================================
    iniciar() {
        // Verifica consentimento LGPD
        const consentimento = document.getElementById('consentimento-lgpd');
        if (!consentimento || !consentimento.checked) {
            alert('⚠️ Você precisa aceitar os termos LGPD para realizar o teste.');
            return;
        }

        // Verifica participante
        if (!this.participanteId) {
            const user = window.VigorreAuth?.getCurrentUser();
            if (user?.participantId) {
                this.participanteId = user.participantId;
            } else {
                alert('⚠️ Participante não identificado. Faça login novamente.');
                return;
            }
        }

        // Verifica se já tem teste ativo
        if (window.VigorreAuth) {
            const sessao = window.VigorreAuth.verificarSessaoTeste(this.participanteId);
            if (sessao) {
                alert('⚠️ Você já possui um teste em andamento. Termine antes de iniciar outro.');
                return;
            }
            window.VigorreAuth.iniciarTeste(this.participanteId, this.tipo);
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

        // Log de início
        this._log('inicio_teste', { tipo: this.tipo });
    }

    // ============================================
    // MOSTRAR PERGUNTA
    // ============================================
    mostrarPergunta(index) {
        if (index >= this.totalPerguntas) {
            this.finalizarTeste();
            return;
        }

        const pergunta = this.perguntas[index];
        if (!pergunta) {
            this.finalizarTeste();
            return;
        }

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
        const progressoEl = document.getElementById('progresso-bar');
        const progressoTexto = document.getElementById('teste-progresso');
        if (progressoEl) progressoEl.style.width = `${progresso}%`;
        if (progressoTexto) progressoTexto.textContent = `${Math.round(progresso)}%`;

        // Reseta seleção dos botões
        document.querySelectorAll('.opcao-btn').forEach(btn => {
            btn.classList.remove('selecionado-more', 'selecionado-less');
            btn.disabled = false;
        });

        // Mostra dica da dimensão
        this._mostrarDicaDimensao(pergunta);
    }

    // ============================================
    // SALVAR RESPOSTA
    // ============================================
    salvarResposta(opcao, tipo) {
        if (!this.testeAtivo) return;

        const pergunta = this.perguntas[this.indiceAtual];
        if (!pergunta) return;

        // Desabilita botões
        document.querySelectorAll('.opcao-btn').forEach(btn => {
            btn.disabled = true;
        });

        // Marca seleção
        document.querySelectorAll('.opcao-btn').forEach(btn => {
            if (btn.dataset.opcao === opcao) {
                btn.classList.add(tipo === 'more' ? 'selecionado-more' : 'selecionado-less');
            }
        });

        // Salva resposta
        const dim = opcao === 'a' ? pergunta.dimA : pergunta.dimB;
        this.respostas.push({
            pergunta: this.indiceAtual,
            opcao: opcao,
            tipo: tipo,
            dimensao: dim
        });

        this.indiceAtual++;

        // Troca frase a cada 2 perguntas
        if (this.indiceAtual % 2 === 0) {
            this.proximaFrase();
        }

        // Aguarda um pouco antes de ir para próxima
        setTimeout(() => {
            this.mostrarPergunta(this.indiceAtual);
        }, 300);
    }

    // ============================================
    // FINALIZAR TESTE
    // ============================================
    async finalizarTeste() {
        this.testeAtivo = false;
        this.pararTimer();
        this.pararFrases();

        // Atualiza progresso para 100%
        const progressoEl = document.getElementById('progresso-bar');
        const progressoTexto = document.getElementById('teste-progresso');
        if (progressoEl) progressoEl.style.width = '100%';
        if (progressoTexto) progressoTexto.textContent = '100%';

        // Mostra conclusão
        document.getElementById('teste-questoes').style.display = 'none';
        document.getElementById('teste-conclusao').style.display = 'block';

        // Finaliza sessão do teste
        if (window.VigorreAuth) {
            window.VigorreAuth.finalizarTeste(this.participanteId);
        }

        // Envia resultados
        try {
            await this.enviarResultados();
        } catch (error) {
            console.error('Erro ao enviar resultados:', error);
            document.getElementById('resultado-simples').innerHTML = `
                <div style="color: #EF4444; padding: 20px;">
                    ⚠️ Erro ao processar resultados. Entre em contato com o suporte.
                </div>
            `;
        }
    }

    // ============================================
    // ENVIAR RESULTADOS
    // ============================================
    async enviarResultados() {
        const url = '/api/avaliacao';
        const body = {
            participanteId: this.participanteId,
            tipo: this.tipo,
            respostas: this.respostas,
            perguntas: this.perguntas
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao processar avaliação');
        }

        const result = await response.json();

        if (result.success) {
            this._resultadoId = result.data?.id || null;
            this._resultadoDados = result.data?.resultados || null;
            this.mostrarResultadoSimples();
            return result;
        } else {
            throw new Error(result.error || 'Erro ao processar avaliação');
        }
    }

    // ============================================
    // MOSTRAR RESULTADO SIMPLES
    // ============================================
    mostrarResultadoSimples() {
        const container = document.getElementById('resultado-simples');
        if (!container) return;

        const dados = this._resultadoDados;
        if (!dados) {
            container.innerHTML = `
                <div style="padding: 16px; color: #64748B;">
                    ⏳ Aguardando processamento do resultado...
                </div>
            `;
            return;
        }

        let html = '';

        // DISC
        if (this.tipo === 'disc' && dados.profile) {
            const cores = {
                D: '#EF4444',
                I: '#F59E0B',
                S: '#10B981',
                C: '#3B82F6'
            };
            const nomes = {
                D: 'Dominância',
                I: 'Influência',
                S: 'Estabilidade',
                C: 'Conformidade'
            };

            const scores = dados.normalized || {};
            const primary = dados.profile?.primary || 'D';
            const primaryName = dados.profile?.primaryName || 'Dominância';

            html = `
                <div style="font-size: 3rem; margin-bottom: 8px;">
                    ${this._getEmojiPerfil(primary)}
                </div>
                <div style="font-weight: 700; font-size: 1.4rem; color: ${cores[primary] || '#D97706'};">
                    ${primaryName}
                </div>
                <div style="color: #64748B; font-size: 0.9rem; margin-bottom: 12px;">
                    ${this._getDescricaoPerfil(primary)}
                </div>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    ${Object.entries(scores).map(([dim, score]) => `
                        <div style="text-align: center;">
                            <div style="font-weight: 700; color: ${cores[dim] || '#94A3B8'};">
                                ${dim}
                            </div>
                            <div style="font-size: 1.2rem; font-weight: 600; color: #0A2540;">
                                ${score}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Big Five
        else if (this.tipo === 'bigfive' && dados.normalized) {
            const cores = {
                O: '#8B5CF6',
                C: '#10B981',
                E: '#F59E0B',
                A: '#EC4899',
                N: '#EF4444'
            };
            const nomes = {
                O: 'Abertura',
                C: 'Consciência',
                E: 'Extroversão',
                A: 'Amabilidade',
                N: 'Neuroticismo'
            };

            const scores = dados.normalized;
            const maior = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

            html = `
                <div style="font-size: 2rem; margin-bottom: 8px;">📊</div>
                <div style="font-weight: 700; font-size: 1.2rem; color: ${cores[maior?.[0] || 'O'] || '#D97706'};">
                    ${maior ? nomes[maior[0]] : 'Perfil'} (${maior?.[1] || 0}%)
                </div>
                <div style="color: #64748B; font-size: 0.9rem; margin-bottom: 12px;">
                    Dimensão predominante do Big Five
                </div>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    ${Object.entries(scores).map(([dim, score]) => `
                        <div style="text-align: center;">
                            <div style="font-weight: 700; color: ${cores[dim] || '#94A3B8'};">
                                ${dim}
                            </div>
                            <div style="font-size: 1.2rem; font-weight: 600; color: #0A2540;">
                                ${score}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // IE
        else if (this.tipo === 'ie' && dados.generalIndex !== undefined) {
            const nivel = dados.level?.label || 'Em Progresso';
            const cores = {
                'Excelente': '#10B981',
                'Desenvolvido': '#3B82F6',
                'Em Desenvolvimento': '#F59E0B',
                'Em Progresso': '#EF4444'
            };

            html = `
                <div style="font-size: 3rem; margin-bottom: 8px;">🧠</div>
                <div style="font-weight: 700; font-size: 1.4rem; color: ${cores[nivel] || '#D97706'};">
                    ${dados.generalIndex}%
                </div>
                <div style="color: #64748B; font-size: 0.9rem;">
                    ${nivel}
                </div>
            `;
        }

        // Valores
        else if (this.tipo === 'valores' && dados.top5) {
            const top5 = dados.top5 || [];

            html = `
                <div style="font-size: 3rem; margin-bottom: 8px;">⭐</div>
                <div style="font-weight: 600; font-size: 1rem; color: #0A2540; margin-bottom: 8px;">
                    Seus Valores Principais
                </div>
                <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    ${top5.map(v => `
                        <span style="background: ${v.color || '#E2E8F0'}; color: #FFFFFF; padding: 4px 14px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">
                            ${v.name}
                        </span>
                    `).join('')}
                </div>
            `;
        }

        // SWOT
        else if (this.tipo === 'swot' && dados.scores) {
            const scores = dados.scores || {};
            const icones = {
                forcas: '💪',
                fraquezas: '⚠️',
                oportunidades: '🌟',
                ameacas: '⚡'
            };

            html = `
                <div style="font-size: 3rem; margin-bottom: 8px;">📋</div>
                <div style="font-weight: 600; font-size: 1rem; color: #0A2540; margin-bottom: 8px;">
                    Análise SWOT
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; max-width: 400px; margin: 0 auto;">
                    ${Object.entries(scores).map(([key, score]) => `
                        <div style="background: #F8FAFC; padding: 8px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 1.2rem;">${icones[key] || '📌'}</div>
                            <div style="font-size: 0.75rem; color: #64748B;">${key}</div>
                            <div style="font-weight: 700; color: #0A2540;">${score}%</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Fallback
        else {
            html = `
                <div style="padding: 16px; color: #64748B;">
                    ✅ Teste concluído com sucesso!
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // ============================================
    // GERAR RELATÓRIO
    // ============================================
    async gerarRelatorio() {
        try {
            const url = '/api/relatorio';
            const body = {
                participanteId: this.participanteId,
                tipo: this.tipo
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao gerar relatório');
            }

            const result = await response.json();
            if (result.success && result.data?.id) {
                window.location.href = `/relatorios/${this.tipo}/${result.data.id}`;
            } else {
                throw new Error('Erro ao gerar relatório');
            }
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            alert('⚠️ Erro ao gerar relatório. Tente novamente.');
        }
    }

    // ============================================
    // GERAR LAUDO
    // ============================================
    async gerarLaudo() {
        try {
            const url = '/api/laudo';
            const body = {
                participanteId: this.participanteId
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao gerar laudo');
            }

            const result = await response.json();
            if (result.success && result.data?.id) {
                window.location.href = `/laudos/${result.data.id}`;
            } else {
                throw new Error('Erro ao gerar laudo');
            }
        } catch (error) {
            console.error('Erro ao gerar laudo:', error);
            alert('⚠️ Erro ao gerar laudo. Tente novamente.');
        }
    }

    // ============================================
    // TIMER
    // ============================================
    iniciarTimer() {
        this.timer = setInterval(() => {
            this.tempoRestante--;
            this.atualizarTimer();

            if (this.tempoRestante <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                alert('⏰ Tempo esgotado!');
                this.finalizarTeste();
            }
        }, 1000);
    }

    pararTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    atualizarTimer() {
        const minutos = Math.floor(this.tempoRestante / 60);
        const segundos = this.tempoRestante % 60;
        const timerEl = document.getElementById('teste-timer');
        if (timerEl) {
            timerEl.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
            if (this.tempoRestante < 60) {
                timerEl.style.color = '#EF4444';
            } else {
                timerEl.style.color = '';
            }
        }
    }

    // ============================================
    // FRASES MOTIVACIONAIS
    // ============================================
    iniciarFrases() {
        this.fraseAtual = 0;
        this.mostrarFrase();
        this.intervaloFrases = setInterval(() => {
            this.proximaFrase();
        }, 12000);
    }

    pararFrases() {
        if (this.intervaloFrases) {
            clearInterval(this.intervaloFrases);
            this.intervaloFrases = null;
        }
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

    // ============================================
    // HELPERS
    // ============================================
    _mostrarDicaDimensao(pergunta) {
        // Pequena dica sobre a dimensão da opção
        const dimA = pergunta.dimA || '';
        const dimB = pergunta.dimB || '';
        const dicaEl = document.getElementById('dica-dimensao');
        if (dicaEl) {
            dicaEl.textContent = `D: ${dimA} | ${dimB}`;
            dicaEl.style.display = 'block';
        }
    }

    _getEmojiPerfil(dim) {
        const emojis = {
            D: '🔴',
            I: '🟡',
            S: '🟢',
            C: '🔵'
        };
        return emojis[dim] || '📊';
    }

    _getDescricaoPerfil(dim) {
        const descricoes = {
            D: 'Orientado a resultados, direto, competitivo e decidido',
            I: 'Comunicativo, persuasivo, otimista e entusiasta',
            S: 'Paciente, confiável, colaborativo e previsível',
            C: 'Detalhista, preciso, analítico e sistemático'
        };
        return descricoes[dim] || 'Perfil comportamental identificado';
    }

    _log(acao, dados) {
        try {
            if (window.VigorreAuth && typeof window.VigorreAuth.logAcao === 'function') {
                window.VigorreAuth.logAcao(this.participanteId || 'sistema', acao, dados);
            }
        } catch (e) {
            // Silencia erro de log
        }
    }
}

// ============================================
// EXPORTAÇÃO GLOBAL
// ============================================
if (typeof window !== 'undefined') {
    window.TesteController = TesteController;
}

export default TesteController;
