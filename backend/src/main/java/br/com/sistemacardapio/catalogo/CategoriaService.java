package br.com.sistemacardapio.catalogo;
import java.util.*;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;
import br.com.sistemacardapio.empresa.*;import br.com.sistemacardapio.tenant.TenantContext;
@Service
public class CategoriaService{
 private final CategoriaRepository repository;private final EmpresaRepository empresas;private final TenantContext tenant;
 public CategoriaService(CategoriaRepository repository,EmpresaRepository empresas,TenantContext tenant){this.repository=repository;this.empresas=empresas;this.tenant=tenant;}
 @Transactional(readOnly=true) public List<Response> listar(){return repository.findAllByEmpresaIdOrderByOrdemAscNomeAsc(tenant.empresaIdObrigatoria()).stream().map(Response::from).toList();}
 @Transactional public Response criar(Request request){UUID empresaId=tenant.empresaIdObrigatoria();if(repository.existsByEmpresaIdAndNomeIgnoreCase(empresaId,request.nome()))throw new IllegalStateException("Categoria já cadastrada");Empresa empresa=empresas.findById(empresaId).orElseThrow();return Response.from(repository.save(new Categoria(empresa,request.nome(),request.descricao(),request.ordem())));}
 @Transactional public Response atualizar(UUID id,Request request){UUID empresaId=tenant.empresaIdObrigatoria();Categoria categoria=repository.findByIdAndEmpresaId(id,empresaId).orElseThrow(()->new IllegalStateException("Categoria não encontrada"));categoria.atualizar(request.nome(),request.descricao(),request.ordem(),request.ativa());return Response.from(categoria);}
 @Transactional public void inativar(UUID id){UUID empresaId=tenant.empresaIdObrigatoria();Categoria c=repository.findByIdAndEmpresaId(id,empresaId).orElseThrow(()->new IllegalStateException("Categoria não encontrada"));c.atualizar(c.getNome(),c.getDescricao(),c.getOrdem(),false);}
 public record Request(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120)String nome,@jakarta.validation.constraints.Size(max=500)String descricao,@jakarta.validation.constraints.PositiveOrZero int ordem,boolean ativa){}
 public record Response(UUID id,String nome,String descricao,int ordem,boolean ativa){static Response from(Categoria c){return new Response(c.getId(),c.getNome(),c.getDescricao(),c.getOrdem(),c.isAtiva());}}
}

