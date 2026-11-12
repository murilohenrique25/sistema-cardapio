package br.com.sistemacardapio.empresa;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistemacardapio.autenticacao.Usuario;
import br.com.sistemacardapio.autenticacao.UsuarioRepository;

@Service
public class EmpresaAdminService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public EmpresaAdminService(EmpresaRepository empresaRepository, UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest request) {
        if (empresaRepository.existsBySlugIgnoreCase(request.slug())) {
            throw new IllegalStateException("Slug já está em uso");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(request.adminEmail())) {
            throw new IllegalStateException("E-mail do administrador já está em uso");
        }

        Empresa empresa = empresaRepository.save(new Empresa(normalizarSlug(request.slug()), request.nomeFantasia().trim()));
        Usuario admin = Usuario.administradorEmpresa(
                request.adminNome().trim(),
                request.adminEmail(),
                passwordEncoder.encode(request.adminSenha()),
                empresa);
        usuarioRepository.save(admin);
        return EmpresaResponse.from(empresa);
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponse> listar() {
        return empresaRepository.findAllByOrderByNomeFantasiaAsc().stream().map(EmpresaResponse::from).toList();
    }

    private String normalizarSlug(String slug) {
        String normalized = slug.trim().toLowerCase();
        if (!normalized.matches("[a-z0-9]+(?:-[a-z0-9]+)*")) {
            throw new IllegalStateException("Slug deve conter apenas letras minúsculas, números e hífens");
        }
        return normalized;
    }

    public record EmpresaResponse(java.util.UUID id, String slug, String nomeFantasia, boolean ativa) {
        static EmpresaResponse from(Empresa empresa) {
            return new EmpresaResponse(empresa.getId(), empresa.getSlug(), empresa.getNomeFantasia(), empresa.isAtiva());
        }
    }

    public record CriarEmpresaRequest(
            @jakarta.validation.constraints.NotBlank String nomeFantasia,
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 80) String slug,
            @jakarta.validation.constraints.NotBlank String adminNome,
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String adminEmail,
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(min = 10) String adminSenha) {}
}

