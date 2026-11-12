package br.com.sistemacardapio.pedido;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.sistemacardapio.tenant.TenantContext;
import br.com.sistemacardapio.autenticacao.UsuarioPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class PedidoAdminService {
    private static final Set<String> STATUS = Set.of("AGUARDANDO_CONTATO", "CONFIRMADO", "EM_PREPARO", "PRONTO", "FINALIZADO", "CANCELADO");
    private final JdbcTemplate jdbc; private final TenantContext tenant; private final PedidoEventoService eventos;
    public PedidoAdminService(JdbcTemplate jdbc, TenantContext tenant,PedidoEventoService eventos) { this.jdbc=jdbc; this.tenant=tenant;this.eventos=eventos; }

    @Transactional(readOnly=true)
    public List<Resumo> listar(String status) {
        UUID empresa=tenant.empresaIdObrigatoria();
        String sql="select id,numero,cliente_nome,cliente_telefone,modalidade,status,pagamento,total,criado_em,agendado_para from pedido where empresa_id=?"+(status==null||status.isBlank()?"":" and status=?")+" order by criado_em desc limit 200";
        Object[] args=status==null||status.isBlank()?new Object[]{empresa}:new Object[]{empresa,status};
        return jdbc.query(sql,(rs,n)->new Resumo(rs.getObject("id",UUID.class),rs.getLong("numero"),rs.getString("cliente_nome"),rs.getString("cliente_telefone"),rs.getString("modalidade"),rs.getString("status"),rs.getString("pagamento"),rs.getBigDecimal("total"),instant(rs.getObject("criado_em",OffsetDateTime.class)),instant(rs.getObject("agendado_para",OffsetDateTime.class))),args);
    }
    @Transactional(readOnly=true)
    public Detalhe obter(UUID id) {
        UUID empresa=tenant.empresaIdObrigatoria();
        Resumo p=jdbc.query("select id,numero,cliente_nome,cliente_telefone,modalidade,status,pagamento,total,criado_em,agendado_para from pedido where id=? and empresa_id=?",rs->rs.next()?new Resumo(rs.getObject("id",UUID.class),rs.getLong("numero"),rs.getString("cliente_nome"),rs.getString("cliente_telefone"),rs.getString("modalidade"),rs.getString("status"),rs.getString("pagamento"),rs.getBigDecimal("total"),instant(rs.getObject("criado_em",OffsetDateTime.class)),instant(rs.getObject("agendado_para",OffsetDateTime.class))):null,id,empresa);
        if(p==null) throw new IllegalStateException("Pedido não encontrado");
        List<Item> itens=jdbc.query("select id,produto_nome,variacao_nome,quantidade,preco_unitario,subtotal,observacao from pedido_item where pedido_id=?",(rs,n)->new Item(rs.getObject(1,UUID.class),rs.getString(2),rs.getString(3),rs.getInt(4),rs.getBigDecimal(5),rs.getBigDecimal(6),rs.getString(7),jdbc.query("select complemento_nome,quantidade,preco_unitario from pedido_item_complemento where pedido_item_id=?",(cr,cn)->new ItemComplemento(cr.getString(1),cr.getInt(2),cr.getBigDecimal(3)),rs.getObject(1,UUID.class))),id);
        Endereco endereco=jdbc.query("select endereco_cep,endereco_rua,endereco_numero,endereco_complemento,endereco_bairro,endereco_referencia,taxa_entrega,subtotal from pedido where id=?",rs->rs.next()?new Endereco(rs.getString(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getString(6),rs.getBigDecimal(7),rs.getBigDecimal(8)):null,id);
        List<Historico> historico=jdbc.query("select status_anterior,novo_status,criado_em from pedido_historico where pedido_id=? order by criado_em",(rs,n)->new Historico(rs.getString(1),rs.getString(2),instant(rs.getObject(3,OffsetDateTime.class))),id);
        return new Detalhe(p,endereco,itens,historico);
    }
    @Transactional public Resumo alterarStatus(UUID id,String novo) {
        if(!STATUS.contains(novo)) throw new IllegalStateException("Status inválido"); UUID empresa=tenant.empresaIdObrigatoria();
        String anterior=jdbc.query("select status from pedido where id=? and empresa_id=? for update",rs->rs.next()?rs.getString(1):null,id,empresa);
        if(anterior==null) throw new IllegalStateException("Pedido não encontrado");
        jdbc.update("update pedido set status=?,atualizado_em=now() where id=? and empresa_id=?",novo,id,empresa);
        Object principal=SecurityContextHolder.getContext().getAuthentication().getPrincipal();UUID usuario=principal instanceof UsuarioPrincipal u?u.usuarioId():null;
        jdbc.update("insert into pedido_historico(id,pedido_id,status_anterior,novo_status,usuario_id) values(?,?,?,?,?)",UUID.randomUUID(),id,anterior,novo,usuario);
        Resumo atualizado=obter(id).pedido();eventos.publicar(empresa,"status-alterado",atualizado);return atualizado;
    }
    public record StatusRequest(String status){} public record Resumo(UUID id,long numero,String clienteNome,String clienteTelefone,String modalidade,String status,String pagamento,BigDecimal total,Instant criadoEm,Instant agendadoPara){}
    private static Instant instant(OffsetDateTime value) { return value == null ? null : value.toInstant(); }
    public record Item(UUID id,String produtoNome,String variacaoNome,int quantidade,BigDecimal precoUnitario,BigDecimal subtotal,String observacao,List<ItemComplemento>complementos){} public record ItemComplemento(String nome,int quantidade,BigDecimal precoUnitario){} public record Endereco(String cep,String rua,String numero,String complemento,String bairro,String referencia,BigDecimal taxaEntrega,BigDecimal subtotal){} public record Historico(String statusAnterior,String novoStatus,Instant criadoEm){} public record Detalhe(Resumo pedido,Endereco endereco,List<Item>itens,List<Historico>historico){}
}
