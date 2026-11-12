package br.com.sistemacardapio.catalogo;
import java.util.UUID;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import org.springframework.web.multipart.MultipartFile;import br.com.sistemacardapio.arquivo.*;import br.com.sistemacardapio.tenant.TenantContext;
@Service public class ProdutoImagemService{
 private final ProdutoRepository produtos;private final ArquivoService arquivos;private final TenantContext tenant;
 public ProdutoImagemService(ProdutoRepository produtos,ArquivoService arquivos,TenantContext tenant){this.produtos=produtos;this.arquivos=arquivos;this.tenant=tenant;}
 @Transactional public Response upload(UUID produtoId,MultipartFile file){Produto p=produtos.findByIdAndEmpresaId(produtoId,tenant.empresaIdObrigatoria()).orElseThrow(()->new IllegalStateException("Produto não encontrado"));Arquivo a=arquivos.armazenarImagem(p.getEmpresa(),file);p.definirImagem(a);return new Response(a.getId());}
 public record Response(UUID arquivoId){}
}
