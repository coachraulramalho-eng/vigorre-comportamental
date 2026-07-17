-- Tabela de participantes
CREATE TABLE participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  empresa_id UUID,
  empresa_nome VARCHAR(255),
  cargo VARCHAR(255),
  departamento VARCHAR(255),
  vigor_index JSONB,
  consentimento BOOLEAN DEFAULT FALSE,
  consentimento_data TIMESTAMP,
  termo_versao VARCHAR(10),
  dados_anonimizados BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de testes
CREATE TABLE testes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  perguntas JSONB,
  dimensoes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de resultados
CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
  data TIMESTAMP DEFAULT NOW(),
  resultados JSONB NOT NULL,
  tipo VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de respostas
CREATE TABLE respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
  pergunta_index INTEGER NOT NULL,
  resposta JSONB NOT NULL,
  data TIMESTAMP DEFAULT NOW()
);

-- Tabela de créditos
CREATE TABLE creditos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID,
  saldo INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de créditos premium
CREATE TABLE creditos_premium (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID,
  saldo INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de reservas de créditos
CREATE TABLE reservas_creditos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID,
  participante_id UUID,
  teste_id VARCHAR(100),
  tipo VARCHAR(20),
  status VARCHAR(20) DEFAULT 'reservado',
  data_reserva TIMESTAMP DEFAULT NOW(),
  data_consumo TIMESTAMP,
  data_cancelamento TIMESTAMP
);

-- Tabela de laudos
CREATE TABLE laudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  empresa_id UUID,
  conteudo JSONB,
  vigor_index JSONB,
  data_geracao TIMESTAMP DEFAULT NOW()
);

-- Tabela de relatórios
CREATE TABLE relatorios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  empresa_id UUID,
  teste_id UUID REFERENCES testes(id) ON DELETE CASCADE,
  conteudo JSONB,
  data_geracao TIMESTAMP DEFAULT NOW()
);

-- Tabela de vagas
CREATE TABLE vagas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  disc_profile VARCHAR(50),
  big_five_requirements JSONB,
  ie_requirements JSONB,
  valores_requirements TEXT[],
  habilidades_requirements TEXT[],
  experiencia_anos_min INTEGER,
  experiencia_anos_max INTEGER,
  status VARCHAR(20) DEFAULT 'aberta',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de consentimento (LGPD)
CREATE TABLE logs_consentimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL,
  data TIMESTAMP DEFAULT NOW(),
  ip VARCHAR(45),
  user_agent TEXT
);

-- Índices
CREATE INDEX idx_participantes_empresa ON participantes(empresa_id);
CREATE INDEX idx_resultados_participante ON resultados(participante_id);
CREATE INDEX idx_resultados_teste ON resultados(teste_id);
CREATE INDEX idx_respostas_participante ON respostas(participante_id);
CREATE INDEX idx_respostas_teste ON respostas(teste_id);
CREATE INDEX idx_vagas_empresa ON vagas(empresa_id);
