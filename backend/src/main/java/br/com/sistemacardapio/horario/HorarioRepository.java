package br.com.sistemacardapio.horario;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HorarioRepository extends JpaRepository<HorarioFuncionamento, UUID> {
    List<HorarioFuncionamento> findAllByEmpresaIdOrderByDiaSemanaAsc(UUID empresaId);
    Optional<HorarioFuncionamento> findByEmpresaIdAndDiaSemana(UUID empresaId, int diaSemana);
}

