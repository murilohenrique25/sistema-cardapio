ALTER TABLE produto DROP CONSTRAINT ck_produto_regra_preco;
ALTER TABLE produto ADD CONSTRAINT ck_produto_regra_preco
    CHECK (regra_preco IN ('SOMA', 'MAIOR_COMPLEMENTO', 'MEDIA_COMPLEMENTOS'));
