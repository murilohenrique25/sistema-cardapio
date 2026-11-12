package br.com.sistemacardapio.autenticacao;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<Usuario> findAllByEmpresaIdOrderByNomeAsc(UUID empresaId);
    Optional<Usuario> findByIdAndEmpresaId(UUID id, UUID empresaId);
}
