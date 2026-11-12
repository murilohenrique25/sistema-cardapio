package br.com.sistemacardapio.arquivo;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import br.com.sistemacardapio.empresa.Empresa;

class ArquivoServiceTest {
    private final ArquivoService service = new ArquivoService(mock(ArquivoRepository.class));

    @Test
    void deveRejeitarArquivoQueNaoSejaImagemMesmoComExtensaoPng() {
        var file = new MockMultipartFile("file", "falso.png", "image/png", "conteudo invalido".getBytes());
        assertThatThrownBy(() -> service.armazenarImagem(new Empresa("teste", "Teste"), file))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Formato inválido");
    }

    @Test
    void deveRejeitarImagemMaiorQueDoisMegabytes() {
        byte[] content = new byte[2 * 1024 * 1024 + 1];
        content[0] = (byte) 0x89; content[1] = 0x50; content[2] = 0x4E; content[3] = 0x47;
        var file = new MockMultipartFile("file", "grande.png", "image/png", content);
        assertThatThrownBy(() -> service.armazenarImagem(new Empresa("teste", "Teste"), file))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("2 MB");
    }
}

