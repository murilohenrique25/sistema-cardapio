package br.com.sistemacardapio.autenticacao;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String senha) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!passwordEncoder.matches(senha, usuario.getSenhaHash())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        return new LoginResponse(
                jwtService.gerar(usuario),
                jwtService.getExpirationSeconds(),
                new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(),
                        usuario.getEmpresa() == null ? null : usuario.getEmpresa().getId(), usuario.isTrocaSenhaObrigatoria()));
    }

    @Transactional
    public LoginResponse alterarSenha(UsuarioPrincipal principal, String senhaAtual, String novaSenha) {
        if (novaSenha == null || novaSenha.length() < 10) throw new IllegalStateException("A nova senha deve possuir pelo menos 10 caracteres");
        Usuario usuario = usuarioRepository.findById(principal.usuarioId()).orElseThrow(() -> new BadCredentialsException("Usuário não encontrado"));
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenhaHash())) throw new BadCredentialsException("Senha atual incorreta");
        usuario.alterarSenha(passwordEncoder.encode(novaSenha), false);
        return new LoginResponse(jwtService.gerar(usuario), jwtService.getExpirationSeconds(),
                new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(), usuario.getEmpresa() == null ? null : usuario.getEmpresa().getId(), false));
    }

    public record LoginResponse(String accessToken, long expiresIn, UsuarioResponse usuario) {}
    public record UsuarioResponse(java.util.UUID id, String nome, String email, PerfilUsuario perfil,
            java.util.UUID empresaId, boolean trocaSenhaObrigatoria) {}
}
