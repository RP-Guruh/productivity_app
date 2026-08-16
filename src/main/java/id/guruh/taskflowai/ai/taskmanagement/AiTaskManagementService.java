package id.guruh.taskflowai.ai.taskmanagement;

import id.guruh.taskflowai.ai.taskmanagement.dto.AiGeneratedRequest;
import id.guruh.taskflowai.ai.taskmanagement.dto.AiGeneratedResponse;
import id.guruh.taskflowai.identity.User;
import id.guruh.taskflowai.identity.UserRepository;
import id.guruh.taskflowai.taskmanagement.board.BoardRepository;
import id.guruh.taskflowai.taskmanagement.board_list.BoardList;
import id.guruh.taskflowai.taskmanagement.board_list.BoardListRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class AiTaskManagementService {

    private static final String SYSTEM_INSTRUCTION_TEMPLATE = """
            Kamu adalah asisten manajemen project berbasis Kanban.
            Tugasmu membaca permintaan user dan mengelompokkan tugas-tugas (tasks) secara otomatis ke dalam board list (kolom) yang sesuai.
            User bisa membutuhkan:
            1. Hanya board list baru (kolom/step project) — isi "boardLists", biarkan setiap boardList.tasks null.
            2. Board list lengkap dengan task di dalamnya — isi "boardLists" dengan tasks ter-nested.

            ATURAN PENTING:
            - JANGAN PERNAH mengisi field "tasks" di tingkat root (selalu biarkan "tasks" null). Semua task WAJIB dikelompokkan ke dalam "boardLists" (kolom) masing-masing.
            - Analisis permintaan user secara seksama. Jika user secara eksplisit meminta kategori baru, board list baru, kolom baru (misal: untuk persiapan ujian, topik belajar tertentu, modul project baru), atau jika alur kerja/topik yang diminta berbeda dari kolom yang sudah ada, AI WAJIB membuat kolom-kolom (boardList) baru yang spesifik dan relevan.
            - Jangan memaksakan memetakan tugas ke kolom generic yang sudah ada (seperti "To Do", "Backlog", "Selesai") jika user meminta kategori baru atau jika tugas-tugas tersebut memiliki topik khusus. Gunakan kolom yang sudah ada HANYA jika tugas tersebut sangat umum dan cocok dimasukkan ke sana.
            - Jika user sedang berada di dalam project/board tertentu, JANGAN PERNAH membuat kolom (boardList) baru dengan nama yang sama dengan nama project/board tersebut (case-insensitive). Pecahlah menjadi tahapan kerja spesifik.

            Field "intentSummary" wajib diisi, jelaskan singkat (1 kalimat) apa yang kamu buat berdasarkan permintaan user.
            Setiap task WAJIB punya: title, description, priority (LOW/MEDIUM/HIGH), dan dueDate (format yyyy-MM-dd, dihitung mulai hari ini: %s).
            Jangan isi field yang tidak diminta — biarkan null, jangan isi array kosong.
            """;

    private final ChatClient chatClient;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final BoardListRepository boardListRepository;

    public AiTaskManagementService(ChatClient chatClient,
                                   UserRepository userRepository,
                                   BoardRepository boardRepository,
                                   BoardListRepository boardListRepository) {
        this.chatClient = chatClient;
        this.userRepository = userRepository;
        this.boardRepository = boardRepository;
        this.boardListRepository = boardListRepository;
    }

    public AiGeneratedResponse generate(AiGeneratedRequest request, String currentUserEmail) {
        User owner = getUserOrThrow(currentUserEmail);
        validateOwnership(request, owner);

        String contextInfo = buildContext(request);
        String systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.formatted(LocalDate.now());
        String userPrompt = buildUserPrompt(request, contextInfo);

        AiGeneratedResponse response = chatClient.prompt()
                .system(systemInstruction)
                .user(userPrompt)
                .call()
                .entity(AiGeneratedResponse.class);

        validateResponse(response);

        return response;
    }

    private void validateOwnership(AiGeneratedRequest request, User owner) {
        if (request.boardId() != null) {
            boardRepository.findById(request.boardId())
                    .filter(board -> board.getOwner().getId().equals(owner.getId()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Board bukan milik Anda"));
        }

        if (request.boardListId() != null) {
            boardListRepository.findById(request.boardListId())
                    .filter(bl -> bl.getBoard().getOwner().getId().equals(owner.getId()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Board list bukan milik Anda"));
        }
    }

    private void validateResponse(AiGeneratedResponse response) {
        boolean hasBoardLists = response.boardLists() != null && !response.boardLists().isEmpty();
        boolean hasTasks = response.tasks() != null && !response.tasks().isEmpty();

        if (!hasBoardLists && !hasTasks) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "AI tidak dapat memahami permintaan. Coba perjelas prompt Anda."
            );
        }
    }

    private String buildUserPrompt(AiGeneratedRequest request, String contextInfo) {
        return """
                %s

                Konteks saat ini:
                %s
                """.formatted(request.prompt(), contextInfo);
    }

    private String buildContext(AiGeneratedRequest request) {
        StringBuilder sb = new StringBuilder();
        if (request.boardName() != null) {
            sb.append("- User sedang berada di project/board: \"").append(request.boardName()).append("\"\n");
        }
        if (request.boardListName() != null) {
            sb.append("- User sedang berada di board list: \"").append(request.boardListName()).append("\"\n");
        }
        if (request.boardId() != null) {
            List<BoardList> existingLists = boardListRepository.findByBoardId(request.boardId().intValue());
            if (existingLists != null && !existingLists.isEmpty()) {
                sb.append("- Status Project: Project ini SUDAH memiliki kolom/board list berikut:\n");
                for (var list : existingLists) {
                    sb.append("  * \"").append(list.getTitle()).append("\"\n");
                }
                sb.append("- Instruksi Tambahan: Kelompokkan tugas-tugas baru ke dalam kolom-kolom yang sudah ada di atas (gunakan nama kolom yang sama persis), hindari membuat kolom baru kecuali jika permintaan user secara spesifik mengharuskannya.\n");
            } else {
                sb.append("- Status Project: Project ini baru dan BELUM memiliki kolom/board list sama sekali.\n");
                sb.append("- Instruksi Tambahan: Buatlah kolom-kolom proses/tahapan baru (misalnya: Persiapan, Pelaksanaan, Selesai, atau tahapan spesifik proyek) dan masukkan tugas ke dalamnya.\n");
            }
        }
        if (sb.isEmpty()) {
            sb.append("- Tidak ada context spesifik, ini permintaan umum.\n");
        }
        return sb.toString();
    }

    private User getUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User tidak ditemukan"));
    }
}