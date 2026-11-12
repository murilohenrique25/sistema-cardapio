package br.com.sistemacardapio.catalogo;
import java.util.*;import org.springframework.data.jpa.repository.JpaRepository;
public interface CategoriaRepository extends JpaRepository<Categoria,UUID>{
 List<Categoria> findAllByEmpresaIdOrderByOrdemAscNomeAsc(UUID empresaId);
 List<Categoria> findAllByEmpresaIdAndAtivaTrueOrderByOrdemAscNomeAsc(UUID empresaId);
 Optional<Categoria> findByIdAndEmpresaId(UUID id,UUID empresaId);
 boolean existsByEmpresaIdAndNomeIgnoreCase(UUID empresaId,String nome);
}

