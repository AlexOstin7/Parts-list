package project.dao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import project.model.Part;

public interface PartDAO {

    Part loadById(Long id);

    Long save(Part part);

    void remove(Part part);

    Integer getCountSets();

    Page<Part> findPaginated(Pageable pageable);

    Part findPaginatedOffset(Pageable pageable);

    Part findPaginatedOffset(Pageable pageable, boolean necessary);

    Part findPaginatedOffset(Pageable pageable, String component);

    Page<Part> findPaginated(Pageable pageable, boolean necessary);

    Page<Part> findPaginated(Pageable pageable, String component);

}
