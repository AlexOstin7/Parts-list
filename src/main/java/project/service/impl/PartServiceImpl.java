package project.service.impl;

import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.dao.PartDAO;
import project.exception.CustomErrorException;
import project.model.Part;
import project.service.PartService;
import project.view.PartView;

import java.util.List;

@Service
@Scope(proxyMode = ScopedProxyMode.INTERFACES)
public class PartServiceImpl implements PartService {
    private final Logger log = LoggerFactory.getLogger(PartServiceImpl.class);
    private final PartDAO dao;

    @Autowired
    public PartServiceImpl(PartDAO dao) {
        this.dao = dao;
    }

    @Override
    @Transactional(readOnly=true)
    public List<Part> getAllParts() {

        log.info("Part Serv getAll before ");
        return Lists.newArrayList(dao.loadAll());
    }

    @Override
    @Transactional(readOnly=true)
    public Part getPartById(Long id) {
        return dao.loadById(id);
    }

    @Override
    @Transactional
    public Long addPart(PartView partView) {
        log.info("org serv add before " + partView.toString());
        Part part = new Part(partView.getComponent(), partView.getQuantity(), partView.isNecessary());
        log.info("org serv add before " + partView.toString());
        return dao.save(part);
    }

    @Override
    @Transactional
    public void deletePart(Long id) {
        Part part = dao.loadById(id);
        log.info("Part service remove  " + id);
        if (part == null) {
            throw new CustomErrorException("Not found part with Id is " + id);
        }
        dao.remove(part);
    }

    @Override
    @Transactional(readOnly=false)
    public void updatePart(PartView partView) {
        Part part = dao.loadById(Long.valueOf(partView.id));

        if (partView.getComponent() != null) part.setComponent(partView.getComponent());
        if (partView.getQuantity() > 0 ) part.setQuantity(partView.getQuantity());
        part.setNecessary(partView.isNecessary());
        log.info("Part service  partView " + partView.toString());
        log.info("Part service  part " + part.toString());
        dao.save(part);
    }


    @Override
    @Transactional(readOnly=true)
    public Long getNubmerOfParts() {
        return dao.getNubmerOfParts();
    }

    @Override
    @Transactional(readOnly=true)
    public Integer getCountSets() {
        return dao.getCountSets();
    }

    @Override
    @Transactional(readOnly=true)
    public Page<Part> findPaginated(int page, int size) {
        log.info("findPaginated serv before run " );
//            return dao.loadAllPaging(new PageRequest(page, size));
        return dao.findPaginated(new PageRequest(page, size));
    }


    @Override
    @Transactional(readOnly=true)
    public Part findPaginatedOffset(int page, int size) {
        log.info("findPaginatedOffset serv before run " );
//            return dao.loadAllPaging(new PageRequest(page, size));
        return dao.findPaginatedOffset(new PageRequest(page, size));
    }

    @Override
    @Transactional(readOnly=true)
    public Part findPaginatedOffset(int page, int size, boolean necessary) {
        log.info("findPaginated serv getoffset necessary  " );
        return dao.findPaginatedOffset(new PageRequest(page, size), necessary);
    }

    @Override
    @Transactional(readOnly=true)
    public Part findPaginatedOffset(int page, int size, String component) {
        log.info("findPaginated serv getoffset component  " );
        return dao.findPaginatedOffset(new PageRequest(page, size), component);
    }

    @Override
    @Transactional(readOnly=true)
    public Page<Part> findPaginated(int page, int size, boolean necessary) {
        log.info("findPaginated serv before run " );
//            return dao.loadAllPaging(new PageRequest(page, size));
        return dao.findPaginated(new PageRequest(page, size), necessary);
    }

    @Override
    @Transactional(readOnly=true)
    public Page<Part> findPaginated(int page, int size, String component) {
        log.info("findPaginated serv getoffset component  " );
//            return dao.loadAllPaging(new PageRequest(page, size));
        return dao.findPaginated(new PageRequest(page, size), component);
    }

    /*
    @Override
    public Page<Part> findAllByPage(Pageable pageable) {
        return dao.loadAll(pageable);
    }
*/


   /* @Override
    @Transactional(readOnly = true)
    public Page<Part> search(String term, int printYear, Pageable pageable) {
        return dao.findBySearchParams(term, printYear, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Part> search(String term, int printYear, boolean readAlReady, Pageable pageable) {
        return dao.findBySearchParamsAndReadAlready(term, printYear, readAlReady, pageable);
    }*/

    /*@Override
    public Part uploadFileData(Part dao, MultipartFile file) throws IOException {

        if (!file.isEmpty()){
            String fileName = file.getOriginalFilename();

            dao.setImageData(file.getBytes());
            dao.setImageStr(fileName);
        }

        return dao;
    }*/
}
