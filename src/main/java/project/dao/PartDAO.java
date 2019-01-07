package project.dao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import project.model.Part;
import project.view.PartFilterView;


import java.util.List;

public interface PartDAO {

    /**
     * Получить все объекты Part
     *
     * @return
     */
    List<Part> loadAll();

    /**
     * Получить Part по идентификатору
     *
     * @param id
     * @return
     */
    Part loadById(Long id);

    /**
     * Получить Part по имени
     *
     * @param name
     * @return
     */

    /**
     * Сохранить Part
     *
     * @param part
     */
    Long save(Part part);

    void remove(Part part);

   /* List<Part> filterPartList(PartFilterView partFilterView);*/

    Long getNubmerOfParts();

    Integer getMinQuantityWithNecessaryParts();

    @Query("SELECT n FROM Network n")
    Page<Part> findPaginated(Pageable pageable);

    @Query("SELECT n FROM Network n")
    Part findPaginatedOffset(Pageable pageable);

    @Query("SELECT n FROM Network n")
    Part findPaginatedOffset(Pageable pageable, boolean necessary);

    @Query("SELECT n FROM Network n")
    Part findPaginatedOffset(Pageable pageable, String component);

    @Query("SELECT n FROM Network n")
    Page<Part> findPaginated(Pageable pageable, boolean necessary);


    @Query("SELECT n FROM Network n")
    Page<Part> findPaginated(Pageable pageable, String component);

}
