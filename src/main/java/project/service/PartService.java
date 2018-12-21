package project.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import project.model.Part;
import project.view.PartView;

import java.io.IOException;
import java.util.List;

public interface PartService {

    List<Part> getAllParts();

    Part getPartById(Long id);

    Long addPart(PartView partView);

    void deletePart(Long id);

    void updatePart(PartView partView);

    /*Page<Part> getAllByPage(Pageable pageable);*/

    Page<Part> findPaginated(int page, int size);

    Long getNubmerOfParts();

/*
    Page<Part> findAllPartsByPage(Pageable pageable);

    Page<Part> search(String term, int printYear, Pageable pageable);
    Page<Part> search(String term, int printYear, boolean readAlReady, Pageable pageable);
*/

//    Part uploadFileData(Part part, MultipartFile file) throws IOException;
}
