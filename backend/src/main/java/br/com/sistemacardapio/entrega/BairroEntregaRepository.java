package br.com.sistemacardapio.entrega;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BairroEntregaRepository extends JpaRepository<BairroEntrega, UUID> {
    List<BairroEntrega> findAllByEmpresaIdOrderByOrdemAscNomeAsc(UUID empresaId);
    List<BairroEntrega> findAllByEmpresaIdAndAtivoTrueOrderByOrdemAscNomeAsc(UUID empresaId);
    Optional<BairroEntrega> findByIdAndEmpresaId(UUID id, UUID empresaId);
    boolean existsByEmpresaIdAndNomeIgnoreCase(UUID empresaId, String nome);
}
