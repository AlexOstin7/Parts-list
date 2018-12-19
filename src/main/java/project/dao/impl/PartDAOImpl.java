package project.dao.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.dao.PartDAO;
import project.model.Part;
import project.service.impl.PartServiceImpl;
import project.view.PartFilterView;

import javax.persistence.*;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.util.Collections;
import java.util.List;

@Service
@Scope(proxyMode = ScopedProxyMode.INTERFACES)
public class PartDAOImpl implements PartDAO {

    private final EntityManager em;
    private final Logger log = LoggerFactory.getLogger(PartServiceImpl.class);

    //private EntityManager entityManager;
    @Autowired
    public PartDAOImpl(EntityManager em) {
        this.em = em;
    }


    @Override
    public List<Part> loadAll() {
        TypedQuery<Part> query = em.createQuery("SELECT p FROM Part p", Part.class);
        //TypedQuery<Part> query = em.createQuery("FROM Part", Part.class);
        return query.getResultList();
    }


    @Override
    public Part loadById(Long id) {
        return em.find(Part.class, id);
    }


    @Override
    public void save(Part part) {
        em.persist(part);
    }

    @Override
    public void remove(Part part) {
        em.remove(part);
    }

    @Override
    public Page<Part> findPaginated(Pageable pageable) {
//        new PageRequest(pageable.getPageNumber(),pageable.getPageSize());
//        log.info("org serv before update " + part.toString());
//        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
/*
        CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
        countQuery.select(criteriaBuilder.count(countQuery.from(Part.class)));
        Long count = em.createQuery(countQuery).getSingleResult();
        */
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();

        Long count = getNubmerOfParts();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber()*pageSize );
            typedQuery.setMaxResults(pageSize);
//            System.out.println("Current page: " + typedQuery.getResultList());
            list = typedQuery.getResultList();
        }
        /*TypedQuery<Part> query = em.createQuery("SELECT p FROM Part p", Part.class);
        List<Part> list = loadAll();*/
        log.info("findPaginated dao before " + "size List " + list.size() + " count " + count + "page Number " + pageNumber + " list.toString " + list.toString());
        Page<Part> page = new PageImpl<>(list, pageable, count.intValue());
        log.info("findPaginated dao before " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
        return page;

    }

    @Override
    public Long getNubmerOfParts() {
        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();

        CriteriaQuery<Long> countQuery = criteriaBuilder
                .createQuery(Long.class);
        countQuery.select(criteriaBuilder
                .count(countQuery.from(Part.class)));
        Long count = em.createQuery(countQuery)
                .getSingleResult();
        return count;
    }
}