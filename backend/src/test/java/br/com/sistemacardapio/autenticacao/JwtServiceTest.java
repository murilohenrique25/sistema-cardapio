package br.com.sistemacardapio.autenticacao;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(
            "teste-chave-jwt-com-mais-de-trinta-e-dois-caracteres",
            "sistema-cardapio-test",
            15);

    @Test
    void deveGerarEValidarTokenDoSuperAdministrador() {
        Usuario usuario = Usuario.superAdmin("Administrador", "admin@sistema.local", "hash");

        UsuarioPrincipal principal = jwtService.validar(jwtService.gerar(usuario));

        assertThat(principal.usuarioId()).isEqualTo(usuario.getId());
        assertThat(principal.email()).isEqualTo("admin@sistema.local");
        assertThat(principal.perfil()).isEqualTo(PerfilUsuario.SUPER_ADMIN);
        assertThat(principal.empresaId()).isNull();
    }
}

