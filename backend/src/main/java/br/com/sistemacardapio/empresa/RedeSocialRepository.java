package br.com.sistemacardapio.empresa;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RedeSocialRepository extends JpaRepository<RedeSocial, UUID> {
    List<RedeSocial> findAllByEmpresaIdAndAtivaTrue(UUID empresaId);
    void deleteAllByEmpresaId(UUID empresaId);
}

