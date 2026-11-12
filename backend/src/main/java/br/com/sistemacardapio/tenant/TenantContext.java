package br.com.sistemacardapio.tenant;

import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import br.com.sistemacardapio.autenticacao.PerfilUsuario;
import br.com.sistemacardapio.autenticacao.UsuarioPrincipal;
import br.com.sistemacardapio.autenticacao.UsuarioRepository;

@Component
public class TenantContext {
    private final UsuarioRepository usuarios;

    public TenantContext(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    public UUID empresaIdObrigatoria() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UsuarioPrincipal usuario)
                || usuario.perfil() != PerfilUsuario.ADMIN_EMPRESA) {
            throw new IllegalStateException("Usuário não está vinculado a uma empresa");
        }
        if (usuario.empresaId() != null) return usuario.empresaId();
        return usuarios.findById(usuario.usuarioId())
                .filter(atual -> atual.isAtivo() && atual.getPerfil() == PerfilUsuario.ADMIN_EMPRESA)
                .map(atual -> atual.getEmpresa() == null ? null : atual.getEmpresa().getId())
                .orElseThrow(() -> new IllegalStateException("Administrador sem estabelecimento associado. Entre novamente ou peça ao superadministrador para revisar seu acesso."));
    }
}
