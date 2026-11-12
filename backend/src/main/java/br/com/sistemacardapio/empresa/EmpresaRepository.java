package br.com.sistemacardapio.empresa;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {
    Optional<Empresa> findBySlugAndAtivaTrue(String slug);
    boolean existsBySlugIgnoreCase(String slug);
    java.util.List<Empresa> findAllByOrderByNomeFantasiaAsc();
}
