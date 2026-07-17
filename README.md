# 🧠 VIGORRE ONE™ - People Intelligence Enterprise

[![Vigorre One](https://img.shields.io/badge/VIGORRE-ONE-D97706?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwQTI1NDAiLz48dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtc2l6ZT0iNDAiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCxTYW5zLXNlcmlmIiBmaWxsPSIjRDk3NzA2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5WPC90ZXh0Pjwvc3ZnPg==)](https://vigorre.com.br)

**Plataforma SaaS de Inteligência Humana, Assessment Comportamental e People Analytics**

---

## 📋 Sobre

A **VIGORRE ONE™** é uma plataforma completa para avaliação comportamental, desenvolvimento humano e People Analytics. Oferece 5 testes científicos integrados em uma única plataforma, com relatórios executivos (20-30 páginas) e Laudos VIGOR® (80-100 páginas).

### 🎯 Público-Alvo

- **Pessoas Físicas:** Profissionais, estudantes, líderes, executivos
- **Empresas:** Pequenas, médias e grandes empresas
- **Consultorias:** RH, Coaching, Mentoria

---

## 📦 Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura da aplicação |
| **CSS3** | Estilização com variáveis CSS |
| **JavaScript (ES6+)** | Lógica da aplicação |
| **Supabase** | Banco de dados e autenticação |
| **Chart.js** | Visualização de dados e gráficos |
| **Google Gemini API** | Assistente de IA |
| **Vercel** | Hospedagem e deploy |

---

## 🧪 Testes Disponíveis

| Teste | Perguntas | Duração | Formato |
|-------|-----------|---------|---------|
| **DISC** | 28 | 5 min | MAIS / MENOS |
| **Big Five** | 60 | 12 min | Likert 1-5 |
| **Inteligência Emocional** | 40 | 8 min | Likert 1-5 |
| **Valores** | 36 | 6 min | Priorização 1-5 |
| **SWOT** | 40 | 10 min | Likert 1-5 |
| **TOTAL** | **204** | **41 min** | - |

---

## 📄 Relatórios e Laudos

### 📄 Relatório Executivo (20-30 páginas)
- Perfil completo e detalhado
- Pontos fortes e áreas de desenvolvimento
- PDI (Plano de Desenvolvimento Individual)
- Plano 30/60/90/180/365 dias
- **Requer 1 crédito**

### 📋 Laudo VIGOR® (80-100 páginas)
- Integração com todos os testes realizados
- Análise de neurociência, psicologia e coaching
- Mapa de competências, riscos e potenciais
- PDI completo com exercícios diários
- QR Code e Hash de autenticidade
- **Requer 1 crédito premium**

---

## 🚀 Estrutura do Projeto
vigorre-one/
├── admin/ # Dashboard Master
├── api/ # APIs da plataforma
├── assets/ # CSS, imagens, fontes
│ ├── css/
│ │ ├── variables.css # Variáveis CSS padronizadas
│ │ ├── globals.css
│ │ └── ia-assistant.css
│ └── images/
├── bi/ # Business Intelligence
│ ├── analytics.html
│ └── executive-insights.html
├── components/ # Componentes reutilizáveis
│ └── ia-assistant.js
├── data/ # Dados dos testes
│ ├── perguntas-disc.js
│ ├── perguntas-bigfive.js
│ ├── perguntas-ie.js
│ ├── perguntas-valores.js
│ └── perguntas-swot.js
├── laudos/ # Laudo VIGOR®
├── middleware/ # Middleware de autenticação
├── organizacao/ # Dashboard Empresa
├── participante/ # Dashboard Participante
├── relatorios/ # Relatórios por teste
├── services/ # Serviços da plataforma
├── tests/ # Testes comportamentais
│ ├── disc/
│ ├── bigfive/
│ ├── ie/
│ ├── valores/
│ └── swot/
├── .env.example # Variáveis de ambiente
├── auth.js # Autenticação LGPD
├── consentimento.html # Consentimento LGPD
├── contato.html # Página de contato
├── dashboard.html # Dashboard principal
├── index.html # Landing page
├── login.html # Login
├── politica-privacidade.html # Política de Privacidade
├── termos-uso.html # Termos de Uso
├── supabase-config.js # Configuração Supabase
├── manifest.json # PWA
├── robots.txt # SEO
├── sitemap.xml # SEO
├── vercel.json # Configuração Vercel
├── package.json # Dependências
└── README.md # Documentação


---

## 🔧 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/vigorre/vigorre-one.git
cd vigorre-one
