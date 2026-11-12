package br.com.sistemacardapio.autenticacao;

import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.sistemacardapio.empresa.Empresa;
import br.com.sistemacardapio.empresa.EmpresaRepository;
import br.com.sistemacardapio.tenant.TenantContext;

@Service
public class UsuarioAdminService {
    private final UsuarioRepository usuarios;
    private final EmpresaRepository empresas;
    private final PasswordEncoder encoder;
    private final TenantContext tenant;

    public UsuarioAdminService(UsuarioRepository usuarios, EmpresaRepository empresas, PasswordEncoder encoder, TenantContext tenant) {
        this.usuarios = usuarios; this.empresas = empresas; this.encoder = encoder; this.tenant = tenant;
    }

    @Transactional(readOnly = true)
    public List<Response> listarMinhaEmpresa() { return listar(tenant.empresaIdObrigatoria()); }

    @Transactional(readOnly = true)
    public List<Response> listar(UUID empresaId) {
        empresas.findById(empresaId).orElseThrow(() -> new IllegalStateException("Empresa não encontrada"));
        return usuarios.findAllByEmpresaIdOrderByNomeAsc(empresaId).stream().map(Response::from).toList();
    }

    @Transactional
    public Response criarNaMinhaEmpresa(Request request) { return criar(tenant.empresaIdObrigatoria(), request); }

    @Transactional
    public Response criar(UUID empresaId, Request request) {
        validar(request);
        if (usuarios.existsByEmailIgnoreCase(request.email())) throw new IllegalStateException("E-mail já está em uso");
        Empresa empresa = empresas.findById(empresaId).orElseThrow(() -> new IllegalStateException("Empresa não encontrada"));
        return Response.from(usuarios.save(Usuario.administradorEmpresa(request.nome().trim(), request.email(), encoder.encode(request.senhaTemporaria()), empresa)));
    }

    @Transactional
    public Response atualizarMinhaEmpresa(UUID id, UpdateRequest request) {
        Usuario usuario = usuarios.findByIdAndEmpresaId(id, tenant.empresaIdObrigatoria()).orElseThrow(() -> new IllegalStateException("Administrador não encontrado"));
        usuario.atualizar(request.nome(), request.ativo()); return Response.from(usuario);
    }

    @Transactional
    public Response atualizar(UUID empresaId, UUID id, UpdateRequest request) {
        Usuario usuario = usuarios.findByIdAndEmpresaId(id, empresaId).orElseThrow(() -> new IllegalStateException("Administrador não encontrado"));
        usuario.atualizar(request.nome(), request.ativo()); return Response.from(usuario);
    }

    @Transactional
    public Response redefinirMinhaEmpresa(UUID id, PasswordRequest request) {
        return redefinir(tenant.empresaIdObrigatoria(), id, request);
    }

    @Transactional
    public Response redefinir(UUID empresaId, UUID id, PasswordRequest request) {
        if (request.novaSenha() == null || request.novaSenha().length() < 10) throw new IllegalStateException("A senha temporária deve possuir pelo menos 10 caracteres");
        Usuario usuario = usuarios.findByIdAndEmpresaId(id, empresaId).orElseThrow(() -> new IllegalStateException("Administrador não encontrado"));
        usuario.alterarSenha(encoder.encode(request.novaSenha()), true); return Response.from(usuario);
    }

    private void validar(Request request) {
        if (request.nome() == null || request.nome().isBlank()) throw new IllegalStateException("Nome é obrigatório");
        if (request.email() == null || !request.email().contains("@")) throw new IllegalStateException("E-mail inválido");
        if (request.senhaTemporaria() == null || request.senhaTemporaria().length() < 10) throw new IllegalStateException("A senha temporária deve possuir pelo menos 10 caracteres");
    }

    public record Request(String nome, String email, String senhaTemporaria) {}
    public record UpdateRequest(String nome, boolean ativo) {}
    public record PasswordRequest(String novaSenha) {}
    public record Response(UUID id, String nome, String email, boolean ativo, boolean trocaSenhaObrigatoria) {
        static Response from(Usuario usuario) { return new Response(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.isAtivo(), usuario.isTrocaSenhaObrigatoria()); }
    }
}
