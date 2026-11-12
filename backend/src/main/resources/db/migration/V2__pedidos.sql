CREATE SEQUENCE pedido_numero_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    cliente_id UUID REFERENCES cliente(id),
    numero BIGINT NOT NULL DEFAULT nextval('pedido_numero_seq'),
    cliente_nome VARCHAR(160) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    modalidade VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AGUARDANDO_CONTATO',
    pagamento VARCHAR(20) NOT NULL,
    troco_para NUMERIC(12,2),
    subtotal NUMERIC(12,2) NOT NULL,
    taxa_entrega NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    bairro_entrega_id UUID REFERENCES bairro_entrega(id),
    endereco_cep VARCHAR(10),
    endereco_rua VARCHAR(200),
    endereco_numero VARCHAR(30),
    endereco_complemento VARCHAR(120),
    endereco_bairro VARCHAR(120),
    endereco_referencia VARCHAR(255),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_pedido_modalidade CHECK (modalidade IN ('ENTREGA', 'RETIRADA')),
    CONSTRAINT ck_pedido_status CHECK (status IN ('AGUARDANDO_CONTATO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT ck_pedido_pagamento CHECK (pagamento IN ('DINHEIRO', 'PIX', 'CREDITO', 'DEBITO')),
    CONSTRAINT ck_pedido_valores CHECK (subtotal >= 0 AND taxa_entrega >= 0 AND total >= 0),
    CONSTRAINT ck_pedido_endereco CHECK (
        modalidade = 'RETIRADA' OR
        (endereco_rua IS NOT NULL AND endereco_numero IS NOT NULL AND endereco_bairro IS NOT NULL)
    ),
    UNIQUE (empresa_id, numero)
);

CREATE TABLE pedido_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedido(id),
    produto_id UUID NOT NULL REFERENCES produto(id),
    variacao_id UUID REFERENCES produto_variacao(id),
    produto_nome VARCHAR(160) NOT NULL,
    variacao_nome VARCHAR(120),
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    observacao VARCHAR(500),
    CONSTRAINT ck_item_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_item_valores CHECK (preco_unitario >= 0 AND subtotal >= 0)
);

CREATE TABLE pedido_item_complemento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_item_id UUID NOT NULL REFERENCES pedido_item(id),
    complemento_id UUID NOT NULL REFERENCES complemento(id),
    complemento_nome VARCHAR(120) NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario NUMERIC(12,2) NOT NULL,
    CONSTRAINT ck_item_complemento_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_item_complemento_preco CHECK (preco_unitario >= 0)
);

CREATE TABLE pedido_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedido(id),
    status_anterior VARCHAR(30),
    novo_status VARCHAR(30) NOT NULL,
    usuario_id UUID REFERENCES usuario(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedido_empresa_criado ON pedido(empresa_id, criado_em DESC);
CREATE INDEX idx_pedido_cliente ON pedido(cliente_id, criado_em DESC);
CREATE INDEX idx_pedido_telefone ON pedido(cliente_telefone, criado_em DESC);
CREATE INDEX idx_pedido_item_pedido ON pedido_item(pedido_id);
CREATE INDEX idx_pedido_historico_pedido ON pedido_historico(pedido_id, criado_em);

