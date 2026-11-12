package br.com.sistemacardapio.promocao;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.sistemacardapio.tenant.TenantContext;

@Service
public class CupomService {
    private final JdbcTemplate jdbc; private final TenantContext tenant;
    public CupomService(JdbcTemplate jdbc,TenantContext tenant){this.jdbc=jdbc;this.tenant=tenant;}
    @Transactional(readOnly=true) public List<Response> listar(){return jdbc.query("select id,codigo,tipo,valor,pedido_minimo,limite_usos,somente_primeira_compra,inicio,fim,ativo,(select count(*) from pedido p where p.cupom_id=c.id) from cupom c where empresa_id=? order by criado_em desc",(rs,n)->new Response(rs.getObject(1,UUID.class),rs.getString(2),rs.getString(3),rs.getBigDecimal(4),rs.getBigDecimal(5),(Integer)rs.getObject(6),rs.getBoolean(7),rs.getObject(8,Instant.class),rs.getObject(9,Instant.class),rs.getBoolean(10),rs.getInt(11)),tenant.empresaIdObrigatoria());}
    @Transactional public Response criar(Request r){validar(r);UUID id=UUID.randomUUID();jdbc.update("insert into cupom(id,empresa_id,codigo,tipo,valor,pedido_minimo,limite_usos,somente_primeira_compra,inicio,fim,ativo) values(?,?,?,?,?,?,?,?,?,?,?)",id,tenant.empresaIdObrigatoria(),codigo(r.codigo()),r.tipo(),r.valor(),zero(r.pedidoMinimo()),r.limiteUsos(),r.somentePrimeiraCompra(),r.inicio(),r.fim(),r.ativo());return obter(id);}
    @Transactional public Response atualizar(UUID id,Request r){validar(r);int changed=jdbc.update("update cupom set codigo=?,tipo=?,valor=?,pedido_minimo=?,limite_usos=?,somente_primeira_compra=?,inicio=?,fim=?,ativo=? where id=? and empresa_id=?",codigo(r.codigo()),r.tipo(),r.valor(),zero(r.pedidoMinimo()),r.limiteUsos(),r.somentePrimeiraCompra(),r.inicio(),r.fim(),r.ativo(),id,tenant.empresaIdObrigatoria());if(changed==0)throw new IllegalStateException("Cupom não encontrado");return obter(id);}
    private Response obter(UUID id){return listar().stream().filter(x->x.id().equals(id)).findFirst().orElseThrow();}
    private void validar(Request r){if(r.codigo()==null||r.codigo().isBlank())throw new IllegalStateException("Informe o código");if(!Set.of("FIXO","PERCENTUAL","FRETE_GRATIS").contains(r.tipo()))throw new IllegalStateException("Tipo de cupom inválido");if(r.valor()==null||r.valor().signum()<0)throw new IllegalStateException("Valor inválido");if("PERCENTUAL".equals(r.tipo())&&r.valor().compareTo(BigDecimal.valueOf(100))>0)throw new IllegalStateException("Percentual não pode superar 100%");if(r.inicio()==null||r.fim()==null||!r.fim().isAfter(r.inicio()))throw new IllegalStateException("Período inválido");if(r.limiteUsos()!=null&&r.limiteUsos()<1)throw new IllegalStateException("Limite de usos inválido");}
    private String codigo(String value){return value.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9_-]","");}private BigDecimal zero(BigDecimal v){return v==null?BigDecimal.ZERO:v;}
    public record Request(String codigo,String tipo,BigDecimal valor,BigDecimal pedidoMinimo,Integer limiteUsos,boolean somentePrimeiraCompra,Instant inicio,Instant fim,boolean ativo){}
    public record Response(UUID id,String codigo,String tipo,BigDecimal valor,BigDecimal pedidoMinimo,Integer limiteUsos,boolean somentePrimeiraCompra,Instant inicio,Instant fim,boolean ativo,int usos){}
}
