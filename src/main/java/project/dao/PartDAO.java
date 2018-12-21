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

    @Query("SELECT n FROM Network n")
    Page<Part> findPaginated(Pageable pageable);

    Long getNubmerOfParts();

}
