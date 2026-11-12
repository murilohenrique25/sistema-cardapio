package br.com.sistemacardapio.empresa;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.com.sistemacardapio.autenticacao.Usuario;
import br.com.sistemacardapio.autenticacao.UsuarioRepository;

class EmpresaAdminServiceTest {

    @Test
    void deveCriarEmpresaEAdministradorNaMesmaOperacao() {
        EmpresaRepository empresaRepository = mock(EmpresaRepository.class);
        UsuarioRepository usuarioRepository = mock(UsuarioRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(empresaRepository.save(any(Empresa.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode("senha-segura")).thenReturn("hash-argon2");

        var service = new EmpresaAdminService(empresaRepository, usuarioRepository, passwordEncoder);
        var request = new EmpresaAdminService.CriarEmpresaRequest(
                "Alabama Burger", "alabama-burger", "Maria Silva", "maria@alabama.com", "senha-segura");

        var response = service.criar(request);

        assertThat(response.slug()).isEqualTo("alabama-burger");
        assertThat(response.nomeFantasia()).isEqualTo("Alabama Burger");
        verify(empresaRepository).save(any(Empresa.class));
        verify(usuarioRepository).save(any(Usuario.class));
        verify(passwordEncoder).encode("senha-segura");
    }
}

