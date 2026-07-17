// ============================================
// IA ASSISTANT - VIGORRE ONE™
// Assistente flutuante com Google Gemini
// ============================================

class IAAssistant {
    constructor(config = {}) {
        this.apiKey = config.apiKey || null;
        this.model = config.model || 'gemini-pro';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.contexto = config.contexto || this._getContextoPadrao();
        this.historico = [];
        this.isOpen = false;
        this.isLoading = false;
        this.element = null;

        this.sugestoes = [
            'Como interpretar meu perfil DISC?',
            'O que significa meu resultado Big Five?',
            'Como melhorar minha inteligência emocional?',
            'Me explique o índice VIGOR®',
            'Qual meu perfil comportamental?',
            'Como usar meu PDI?'
        ];

        this.init();
    }

    init() {
        this.criarElemento();
        this.carregarHistorico();
        this.configurarEventos();
        this.mostrarBoasVindas();
        console.log('🧠 IA Assistant carregado com sucesso!');
    }

    criarElemento() {
        const container = document.createElement('div');
        container.className = 'ia-assistant';
        container.innerHTML = `
            <div class="ia-assistant-window" id="iaWindow">
                <div class="ia-header">
                    <div class="ia-title">
                        <span class="icon">🧠</span>
                        Vigorre AI™
                    </div>
                    <button class="ia-close" id="iaClose">✕</button>
                </div>
                <div class="ia-body" id="iaBody">
                    <div class="ia-message assistant">
                        <span class="ia-message-icon">👋</span>
                        Olá! Sou o assistente Vigorre AI™. Como posso ajudá-lo hoje?
                    </div>
                    <div class="ia-suggestions" id="iaSuggestions">
                        ${this.sugestoes.map(s => `<button onclick="window.iaAssistant.enviarSugestao('${s}')">${s}</button>`).join('')}
                    </div>
                </div>
                <div class="ia-footer">
                    <input type="text" id="iaInput" placeholder="Digite sua pergunta..." />
                    <button id="iaSend">Enviar</button>
                </div>
            </div>
            <button class="ia-assistant-toggle" id="iaToggle">
                💬
                <span class="tooltip">Pergunte à Vigorre AI™</span>
            </button>
        `;

        document.body.appendChild(container);
        this.element = container;
        this.adicionarStyles();
    }

    adicionarStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/css/ia-assistant.css';
        document.head.appendChild(link);
    }

    configurarEventos() {
        const toggle = document.getElementById('iaToggle');
        const close = document.getElementById('iaClose');
        const send = document.getElementById('iaSend');
        const input = document.getElementById('iaInput');

        toggle.addEventListener('click', () => this.toggle());
        close.addEventListener('click', () => this.fechar());
        send.addEventListener('click', () => this.enviar());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.enviar();
        });
    }

    toggle() {
        this.isOpen ? this.fechar() : this.abrir();
    }

    abrir() {
        this.isOpen = true;
        const window = document.getElementById('iaWindow');
        const body = document.getElementById('iaBody');
        window.classList.add('open');
        setTimeout(() => {
            body.scrollTop = body.scrollHeight;
        }, 100);
        this.focarInput();
    }

    fechar() {
        this.isOpen = false;
        document.getElementById('iaWindow').classList.remove('open');
    }

    focarInput() {
        setTimeout(() => {
            document.getElementById('iaInput').focus();
        }, 200);
    }

    async enviar() {
        const input = document.getElementById('iaInput');
        const texto = input.value.trim();
        if (!texto || this.isLoading) return;

        input.value = '';
        this.adicionarMensagem(texto, 'user');
        this.removerSugestoes();

        try {
            this.isLoading = true;
            this.mostrarLoading();

            const resposta = await this.chamarGemini(texto);

            this.removerLoading();
            this.adicionarMensagem(resposta, 'assistant');
            this.salvarHistorico(texto, resposta);

        } catch (error) {
            this.removerLoading();
            this.adicionarMensagem(
                '❌ Desculpe, não foi possível processar sua pergunta. Tente novamente ou entre em contato com o suporte.',
                'assistant'
            );
            console.error('❌ Erro na IA:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async chamarGemini(pergunta) {
        // Se não tiver API Key, usa resposta simulada
        if (!this.apiKey) {
            console.warn('⚠️ API Key não configurada. Usando modo simulado.');
            return this.simularResposta(pergunta);
        }

        try {
            const url = `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`;

            const body = {
                contents: [{
                    parts: [{
                        text: this._montarPrompt(pergunta)
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                    topK: 40,
                    topP: 0.95
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Erro na API Gemini');
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
        } catch (error) {
            console.error('❌ Erro ao chamar Gemini:', error);
            return this.simularResposta(pergunta);
        }
    }

    _montarPrompt(pergunta) {
        return `
            Você é o assistente da Vigorre One™, uma plataforma de People Intelligence Enterprise.
            Você ajuda usuários a entenderem seus resultados de testes comportamentais:
            DISC, Big Five, Inteligência Emocional, Valores e SWOT.

            Contexto da plataforma:
            ${this.contexto}

            Regras:
            1. Responda de forma clara, objetiva e profissional
            2. Sempre com linguagem positiva e encorajadora
            3. Use emojis moderadamente para tornar a conversa amigável
            4. Se não souber algo, diga "Não tenho essa informação, mas posso ajudá-lo com outros assuntos"
            5. Seja breve, máximo 3 parágrafos

            Pergunta do usuário: ${pergunta}
        `;
    }

    simularResposta(pergunta) {
        const respostas = {
            'disc': 'O DISC avalia 4 dimensões: Dominância (resultados), Influência (comunicação), Estabilidade (paciência) e Conformidade (precisão). Seu perfil predominante mostra como você age, decide e se comunica no dia a dia.',
            'big five': 'O Big Five mede 5 fatores: Abertura (criatividade), Conscienciosidade (organização), Extroversão (sociabilidade), Amabilidade (empatia) e Neuroticismo (estabilidade emocional). Cada fator tem um espectro, e você se posiciona em cada um deles.',
            'inteligência emocional': 'A Inteligência Emocional é a capacidade de reconhecer, compreender e gerenciar suas emoções e as dos outros. Os 5 pilares são: Autoconsciência, Autorregulação, Motivação, Empatia e Habilidades Sociais.',
            'valores': 'Seus valores são o que realmente importa para você. Eles guiam suas decisões, motivações e comportamento. Quando você está alinhado com seus valores, se sente mais realizado e engajado.',
            'swot': 'A análise SWOT pessoal avalia Forças, Fraquezas, Oportunidades e Ameaças. É uma ferramenta estratégica para planejar seu desenvolvimento profissional e pessoal.',
            'vigor': 'O Índice VIGOR® integra todos os seus testes em uma única métrica. Avalia Visão Estratégica, Inteligência Humana, Gestão de Performance, Organização Estrutural e Resultados Sustentáveis.'
        };

        const perguntaLower = pergunta.toLowerCase();
        for (const [key, value] of Object.entries(respostas)) {
            if (perguntaLower.includes(key)) {
                return `${value}\n\n💡 Para uma análise mais detalhada, consulte seu relatório completo na plataforma.`;
            }
        }

        return `📊 Entendo sua pergunta sobre testes comportamentais. Na Vigorre One™, oferecemos 5 avaliações: DISC, Big Five, Inteligência Emocional, Valores e SWOT. Cada teste revela aspectos diferentes do seu perfil.\n\n💡 Recomendo consultar seu relatório completo na plataforma para uma análise mais aprofundada.`;
    }

    adicionarMensagem(texto, tipo) {
        const body = document.getElementById('iaBody');
        const div = document.createElement('div');
        div.className = `ia-message ${tipo}`;

        if (tipo === 'assistant') {
            div.innerHTML = `<span class="ia-message-icon">🧠</span> ${texto}`;
        } else {
            div.textContent = texto;
        }

        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    mostrarLoading() {
        const body = document.getElementById('iaBody');
        const div = document.createElement('div');
        div.className = 'ia-message assistant';
        div.id = 'iaLoading';
        div.innerHTML = `
            <div class="ia-loading">
                <span></span><span></span><span></span>
            </div>
        `;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    removerLoading() {
        const loading = document.getElementById('iaLoading');
        if (loading) loading.remove();
    }

    removerSugestoes() {
        const sugestoes = document.getElementById('iaSuggestions');
        if (sugestoes) sugestoes.remove();
    }

    mostrarBoasVindas() {
        // Já está no HTML
    }

    salvarHistorico(pergunta, resposta) {
        this.historico.push({ pergunta, resposta, data: new Date().toISOString() });
        try {
            localStorage.setItem('ia_historico', JSON.stringify(this.historico));
        } catch (e) { /* ignora */ }
    }

    carregarHistorico() {
        try {
            const data = localStorage.getItem('ia_historico');
            if (data) this.historico = JSON.parse(data);
        } catch (e) { /* ignora */ }
    }

    enviarSugestao(texto) {
        document.getElementById('iaInput').value = texto;
        this.enviar();
    }

    _getContextoPadrao() {
        return `
            - DISC: 4 perfis (Dominância, Influência, Estabilidade, Conformidade)
            - Big Five: 5 fatores (Abertura, Conscienciosidade, Extroversão, Amabilidade, Neuroticismo)
            - Inteligência Emocional: 5 pilares (Autoconsciência, Autorregulação, Motivação, Empatia, Habilidades Sociais)
            - Valores: 10 valores (Poder, Realização, Hedonismo, Estimulação, Autodireção, Universalismo, Benevolência, Tradição, Conformidade, Segurança)
            - SWOT: 4 dimensões (Forças, Fraquezas, Oportunidades, Ameaças)
            - Índice VIGOR®: integra todos os testes em uma única métrica
            - Relatórios: 20-30 páginas, gerados com créditos
            - Laudos: 80-100 páginas, gerados com créditos premium
        `;
    }

    // Configurar API Key
    configurarAPIKey(apiKey) {
        this.apiKey = apiKey;
        console.log('✅ API Key configurada com sucesso!');
    }
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================
let iaAssistant = null;

document.addEventListener('DOMContentLoaded', function() {
    // Aguarda autenticação antes de carregar
    const checkAuth = setInterval(() => {
        if (window.VigorreAuth && window.VigorreAuth.isAuthenticated()) {
            clearInterval(checkAuth);
            iaAssistant = new IAAssistant({
                // Descomente e coloque sua API Key do Google Gemini
                // apiKey: 'SUA_API_KEY_AQUI',
                contexto: `
                    Plataforma de testes comportamentais Vigorre One™.
                    Oferece DISC, Big Five, IE, Valores e SWOT.
                    Gera relatórios de 20-30 páginas e laudos de 80-100 páginas.
                    Índice VIGOR® integra todos os resultados.
                `
            });
            console.log('🧠 IA Assistant inicializado!');
        }
    }, 500);
});

// ============================================
// EXPORTAÇÃO
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IAAssistant;
}

window.IAAssistant = IAAssistant;
