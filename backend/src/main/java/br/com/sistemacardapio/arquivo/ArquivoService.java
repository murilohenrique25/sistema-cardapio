package br.com.sistemacardapio.arquivo;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.sistemacardapio.empresa.Empresa;

@Service
public class ArquivoService {
    private static final int MAX_BYTES = 2 * 1024 * 1024;
    private final ArquivoRepository repository;

    public ArquivoService(ArquivoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Arquivo armazenarImagem(Empresa empresa, MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            if (content.length == 0 || content.length > MAX_BYTES) {
                throw new IllegalStateException("A imagem deve possuir até 2 MB");
            }
            String mime = detectarMime(content);
            String hash = sha256(content);
            return repository.findByEmpresaIdAndHashSha256(empresa.getId(), hash)
                    .orElseGet(() -> repository.save(new Arquivo(
                            empresa,
                            file.getOriginalFilename() == null ? "imagem" : file.getOriginalFilename(),
                            mime,
                            content,
                            hash)));
        } catch (IOException exception) {
            throw new IllegalStateException("Não foi possível processar a imagem");
        }
    }

    private String detectarMime(byte[] bytes) {
        if (bytes.length >= 8 && bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
            return "image/png";
        }
        if (bytes.length >= 3 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
            return "image/jpeg";
        }
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }
        throw new IllegalStateException("Formato inválido. Envie JPG, PNG ou WebP");
    }

    private String sha256(byte[] content) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponível", exception);
        }
    }
}

