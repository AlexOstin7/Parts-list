package project.dao.impl;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.ProjectionList;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
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
import javax.persistence.*;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

@Service
@Scope(proxyMode = ScopedProxyMode.INTERFACES)
public class PartDAOImpl implements PartDAO {

    private final EntityManager em;
    private final Logger log = LoggerFactory.getLogger(PartServiceImpl.class);
    @Autowired
    public PartDAOImpl(EntityManager em) {
        this.em = em;
    }

    @Override
    public Part loadById(Long id) {
        return em.find(Part.class, id);
    }

    @Override
    public Long save(Part part) {
        em.persist(part);
        em.flush();
        return part.getId();
    }

    @Override
    public void remove(Part part) {
        em.remove(part);
    }

    @Override
    public Integer getCountSets() {
        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        Session session = em.unwrap(Session.class);
        session.beginTransaction();
        Criteria criteria = session.createCriteria(Part.class);
        criteria.add(Restrictions.eq("isNecessary", true));
        ProjectionList projList = Projections.projectionList();
        projList.add(Projections.min("quantity"));
        criteria.setProjection(projList);
        int min = 0;
        if (!criteria.list().contains(null)) {
            min = (Integer) criteria.uniqueResult();
        }
        return min;
    }

    @Override
    public Page<Part> findPaginated(Pageable pageable) {
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();

        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize);
            typedQuery.setMaxResults(pageSize);
            list = typedQuery.getResultList();
        }
        Page<Part> page = new PageImpl<>(list, pageable, count);
        return page;

    }

    @Override
    public Part findPaginatedOffset(Pageable pageable) {
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();

        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize + pageSize - 1);
            typedQuery.setMaxResults(1);
        }
        Part part = typedQuery.getResultList().stream().findFirst().orElse(null);
        return part;
    }

    @Override
    public Part findPaginatedOffset(Pageable pageable, boolean necessary) {
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

        select.where(criteriaBuilder.equal(from.get("isNecessary"), necessary));
        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize + pageSize - 1);
            typedQuery.setMaxResults(1);
            list = typedQuery.getResultList();
        }
        Part part = typedQuery.getResultList().stream().findFirst().orElse(null);
        Page<Part> page = new PageImpl<>(list, pageable, count);
        return part;

    }

    @Override
    public Part findPaginatedOffset(Pageable pageable, String component) {
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);
        select.where(criteriaBuilder.like(from.get("component"), "%" + component + "%"));
        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize + pageSize - 1);
            typedQuery.setMaxResults(1);
            list = typedQuery.getResultList();
        }
        Part part = typedQuery.getResultList().stream().findFirst().orElse(null);
        Page<Part> page = new PageImpl<>(list, pageable, count);
        return part;

    }

    @Override
    public Page<Part> findPaginated(Pageable pageable, boolean necessary) {
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

        select.where(criteriaBuilder.equal(from.get("isNecessary"), necessary));

        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize);
            typedQuery.setMaxResults(pageSize);
            list = typedQuery.getResultList();
        }
        Page<Part> page = new PageImpl<>(list, pageable, count);
        return page;
    }

    @Override
    public Page<Part> findPaginated(Pageable pageable, String component) {
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

        select.where(criteriaBuilder.like(from.get("component"), "%" + component + "%"));

        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize);
            typedQuery.setMaxResults(pageSize);
            list = typedQuery.getResultList();
        }
        Page<Part> page = new PageImpl<>(list, pageable, count);
        return page;
    }
}