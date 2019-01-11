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
    public Part getPartById(Long id) {
        return dao.loadById(id);
    }

    @Override
    @Transactional
    public Long addPart(PartView partView) {
        Part part = new Part(partView.getComponent(), partView.getQuantity(), partView.isNecessary());
        return dao.save(part);
    }

    @Override
    @Transactional
    public void deletePart(Long id) {
        Part part = dao.loadById(id);
        if (part == null) {
            throw new CustomErrorException("Not found part with Id is " + id);
        }
        dao.remove(part);
    }

    @Override
    @Transactional(readOnly=false)
    public void updatePart(PartView partView) {
        Part part = dao.loadById(Long.valueOf(partView.id));
        if (part == null) {
            throw new CustomErrorException("Not found part with Id is " + partView.id);
        }
        if (partView.getComponent() != null) part.setComponent(partView.getComponent());
        if (partView.getQuantity() > 0 ) part.setQuantity(partView.getQuantity());
        part.setNecessary(partView.isNecessary());
        dao.save(part);
    }

    @Override
    @Transactional(readOnly=true)
    public Integer getCountSets() {
        return dao.getCountSets();
    }

    @Override
    @Transactional(readOnly=true)
    public Page<Part> findPaginated(int page, int size) {
        return dao.findPaginated(new PageRequest(page, size));
    }

    @Override
    @Transactional(readOnly=true)
    public Part findPaginatedOffset(int page, int size) {
        return dao.findPaginatedOffset(new PageRequest(page, size));
    }

    @Override
    @Transactional(readOnly=true)
    public Part findPaginatedOffset(int page, int size, boolean necessary) {
        return dao.findPaginatedOffset(new PageRequest(page, size), necessary);
    }

    @Override
    @Transactional(readOnly=true)
    public Part findPaginatedOffset(int page, int size, String component) {
        return dao.findPaginatedOffset(new PageRequest(page, size), component);
    }

    @Override
    @Transactional(readOnly=true)
    public Page<Part> findPaginated(int page, int size, boolean necessary) {
        return dao.findPaginated(new PageRequest(page, size), necessary);
    }

    @Override
    @Transactional(readOnly=true)
    public Page<Part> findPaginated(int page, int size, String component) {
        return dao.findPaginated(new PageRequest(page, size), component);
    }
}
