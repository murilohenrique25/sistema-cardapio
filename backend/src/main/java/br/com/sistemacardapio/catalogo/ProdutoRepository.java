package br.com.sistemacardapio.catalogo;
import java.util.*;import org.springframework.data.jpa.repository.JpaRepository;
public interface ProdutoRepository extends JpaRepository<Produto,UUID>{
 List<Produto> findAllByEmpresaIdOrderByCategoriaOrdemAscOrdemAscNomeAsc(UUID empresaId);
 List<Produto> findAllByEmpresaIdAndAtivoTrueOrderByCategoriaOrdemAscOrdemAscNomeAsc(UUID empresaId);
 Optional<Produto> findByIdAndEmpresaId(UUID id,UUID empresaId);
 long countByEmpresaId(UUID empresaId);long countByEmpresaIdAndAtivoTrue(UUID empresaId);long countByEmpresaIdAndDisponivelFalse(UUID empresaId);
}

