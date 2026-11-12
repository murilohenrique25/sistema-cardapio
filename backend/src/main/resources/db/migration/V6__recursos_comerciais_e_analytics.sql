ALTER TABLE empresa
    ADD COLUMN pedido_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN tempo_entrega_min INTEGER,
    ADD COLUMN tempo_entrega_max INTEGER,
    ADD COLUMN frete_gratis_acima NUMERIC(12,2),
    ADD COLUMN tema VARCHAR(30) NOT NULL DEFAULT 'AUTORAL';

ALTER TABLE produto
    ADD COLUMN regra_preco VARCHAR(30) NOT NULL DEFAULT 'SOMA',
    ADD CONSTRAINT ck_produto_regra_preco CHECK (regra_preco IN ('SOMA', 'MAIOR_COMPLEMENTO'));

CREATE TABLE cupom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    codigo VARCHAR(40) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    pedido_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
    limite_usos INTEGER,
    somente_primeira_compra BOOLEAN NOT NULL DEFAULT FALSE,
    inicio TIMESTAMPTZ NOT NULL,
    fim TIMESTAMPTZ NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cupom_empresa_codigo UNIQUE (empresa_id, codigo),
    CONSTRAINT ck_cupom_tipo CHECK (tipo IN ('FIXO', 'PERCENTUAL', 'FRETE_GRATIS')),
    CONSTRAINT ck_cupom_valor CHECK (valor >= 0),
    CONSTRAINT ck_cupom_periodo CHECK (fim > inicio)
);

ALTER TABLE pedido
    ADD COLUMN cupom_id UUID REFERENCES cupom(id),
    ADD COLUMN cupom_codigo VARCHAR(40),
    ADD COLUMN desconto NUMERIC(12,2) NOT NULL DEFAULT 0;

CREATE TABLE analytics_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    produto_id UUID REFERENCES produto(id),
    tipo VARCHAR(30) NOT NULL,
    sessao VARCHAR(80),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_analytics_tipo CHECK (tipo IN ('CARDAPIO_VISUALIZADO','PRODUTO_VISUALIZADO','ADICIONADO_CARRINHO','CHECKOUT_INICIADO','PEDIDO_CRIADO'))
);

CREATE INDEX idx_cupom_empresa_ativo ON cupom(empresa_id, ativo, inicio, fim);
CREATE INDEX idx_analytics_empresa_data ON analytics_evento(empresa_id, criado_em DESC);
CREATE INDEX idx_analytics_produto ON analytics_evento(produto_id, tipo, criado_em DESC);
