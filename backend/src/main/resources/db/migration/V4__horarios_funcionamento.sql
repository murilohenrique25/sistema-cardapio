CREATE TABLE horario_funcionamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(id),
    dia_semana INTEGER NOT NULL,
    aberto BOOLEAN NOT NULL DEFAULT FALSE,
    hora_inicial TIME,
    hora_final TIME,
    CONSTRAINT ck_horario_dia CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT ck_horario_horas CHECK (
        (aberto = FALSE AND hora_inicial IS NULL AND hora_final IS NULL) OR
        (aberto = TRUE AND hora_inicial IS NOT NULL AND hora_final IS NOT NULL)
    ),
    UNIQUE (empresa_id, dia_semana)
);
CREATE INDEX idx_horario_empresa ON horario_funcionamento(empresa_id, dia_semana);

