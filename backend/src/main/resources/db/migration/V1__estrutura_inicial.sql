CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(80) NOT NULL UNIQUE,
    nome_fantasia VARCHAR(160) NOT NULL,
    razao_social VARCHAR(200),
    documento VARCHAR(20),
    telefone VARCHAR(30),
    whatsapp VARCHAR(30),
    email VARCHAR(254),
    descricao TEXT,
    cor_primaria VARCHAR(7) NOT NULL DEFAULT '#E85D04',
    cor_secundaria VARCHAR(7) NOT NULL DEFAULT '#370617',
    cor_destaque VARCHAR(7) NOT NULL DEFAULT '#FFBA08',
    aceita_entrega BOOLEAN NOT NULL DEFAULT TRUE,
    aceita_retirada BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_taxa_entrega VARCHAR(30) NOT NULL DEFAULT 'TAXA_FIXA',
    taxa_entrega_fixa NUMERIC(12,2),
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_empresa_tipo_taxa CHECK (tipo_taxa_entrega IN ('SEM_ENTREGA', 'TAXA_FIXA', 'TAXA_POR_BAIRRO')),
    CONSTRAINT ck_empresa_taxa_fixa CHECK (taxa_entrega_fixa IS NULL OR taxa_entrega_fixa >= 0)
);

CREATE TABLE arquivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    nome_original VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    conteudo BYTEA NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_arquivo_tamanho CHECK (tamanho_bytes > 0 AND tamanho_bytes <= 2097152),
    UNIQUE (empresa_id, hash_sha256)
);

ALTER TABLE empresa
    ADD COLUMN logo_arquivo_id UUID REFERENCES arquivo(id),
    ADD COLUMN banner_arquivo_id UUID REFERENCES arquivo(id);

CREATE TABLE rede_social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    tipo VARCHAR(30) NOT NULL,
    url VARCHAR(500) NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (empresa_id, tipo),
    CONSTRAINT ck_rede_social_tipo CHECK (tipo IN ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'SITE'))
);

CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresa(id),
    nome VARCHAR(160) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_usuario_perfil CHECK (perfil IN ('SUPER_ADMIN', 'ADMIN_EMPRESA')),
    CONSTRAINT ck_usuario_empresa CHECK (
        (perfil = 'SUPER_ADMIN' AND empresa_id IS NULL) OR
        (perfil = 'ADMIN_EMPRESA' AND empresa_id IS NOT NULL)
    )
);

CREATE TABLE cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telefone_normalizado VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(160) NOT NULL,
    email VARCHAR(254),
    senha_hash VARCHAR(255),
    telefone_verificado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE endereco_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES cliente(id),
    cep VARCHAR(10),
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(30) NOT NULL,
    complemento VARCHAR(120),
    bairro VARCHAR(120) NOT NULL,
    referencia VARCHAR(255),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bairro_entrega (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    nome VARCHAR(120) NOT NULL,
    taxa NUMERIC(12,2) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_bairro_taxa CHECK (taxa >= 0),
    UNIQUE (empresa_id, nome)
);

CREATE TABLE categoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(500),
    imagem_arquivo_id UUID REFERENCES arquivo(id),
    ordem INTEGER NOT NULL DEFAULT 0,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (empresa_id, nome)
);

CREATE TABLE produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    categoria_id UUID NOT NULL REFERENCES categoria(id),
    nome VARCHAR(160) NOT NULL,
    descricao TEXT,
    codigo_interno VARCHAR(80),
    preco NUMERIC(12,2) NOT NULL,
    imagem_arquivo_id UUID REFERENCES arquivo(id),
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_produto_preco CHECK (preco >= 0),
    UNIQUE (empresa_id, codigo_interno),
    UNIQUE (empresa_id, id),
    UNIQUE (empresa_id, categoria_id, id)
);

CREATE TABLE produto_variacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    produto_id UUID NOT NULL,
    nome VARCHAR(120) NOT NULL,
    preco NUMERIC(12,2) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_variacao_produto_empresa FOREIGN KEY (empresa_id, produto_id) REFERENCES produto(empresa_id, id),
    CONSTRAINT ck_variacao_preco CHECK (preco >= 0)
);

CREATE TABLE grupo_complemento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    nome VARCHAR(120) NOT NULL,
    obrigatorio BOOLEAN NOT NULL DEFAULT FALSE,
    quantidade_minima INTEGER NOT NULL DEFAULT 0,
    quantidade_maxima INTEGER NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_grupo_limites CHECK (
        quantidade_minima >= 0 AND quantidade_maxima >= 1 AND quantidade_minima <= quantidade_maxima
    )
);

CREATE TABLE complemento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    grupo_id UUID NOT NULL REFERENCES grupo_complemento(id),
    nome VARCHAR(120) NOT NULL,
    preco_adicional NUMERIC(12,2) NOT NULL DEFAULT 0,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_complemento_preco CHECK (preco_adicional >= 0)
);

CREATE TABLE produto_grupo_complemento (
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    produto_id UUID NOT NULL,
    grupo_id UUID NOT NULL REFERENCES grupo_complemento(id),
    ordem INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (empresa_id, produto_id, grupo_id),
    CONSTRAINT fk_produto_grupo_empresa FOREIGN KEY (empresa_id, produto_id) REFERENCES produto(empresa_id, id)
);

CREATE TABLE promocao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    produto_id UUID NOT NULL,
    preco_promocional NUMERIC(12,2) NOT NULL,
    tag VARCHAR(30) NOT NULL DEFAULT 'PROMOÇÃO',
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_promocao_produto_empresa FOREIGN KEY (empresa_id, produto_id) REFERENCES produto(empresa_id, id),
    CONSTRAINT ck_promocao_preco CHECK (preco_promocional >= 0),
    CONSTRAINT ck_promocao_periodo CHECK (fim > inicio)
);

CREATE INDEX idx_arquivo_empresa ON arquivo(empresa_id);
CREATE INDEX idx_categoria_empresa_ativa_ordem ON categoria(empresa_id, ativa, ordem);
CREATE INDEX idx_produto_empresa_categoria ON produto(empresa_id, categoria_id, ativo, ordem);
CREATE INDEX idx_bairro_empresa_ativo ON bairro_entrega(empresa_id, ativo, ordem);
CREATE INDEX idx_promocao_empresa_periodo ON promocao(empresa_id, ativa, inicio, fim);

