ALTER TABLE usuario ADD COLUMN troca_senha_obrigatoria BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE usuario SET troca_senha_obrigatoria = FALSE WHERE perfil = 'SUPER_ADMIN';

ALTER TABLE pedido ADD COLUMN agendado_para TIMESTAMPTZ;
CREATE INDEX idx_pedido_empresa_agendado ON pedido(empresa_id, agendado_para) WHERE agendado_para IS NOT NULL;
