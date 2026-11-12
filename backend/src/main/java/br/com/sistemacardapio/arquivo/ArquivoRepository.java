package br.com.sistemacardapio.arquivo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArquivoRepository extends JpaRepository<Arquivo, UUID> {
    Optional<Arquivo> findByEmpresaIdAndHashSha256(UUID empresaId, String hashSha256);
}

