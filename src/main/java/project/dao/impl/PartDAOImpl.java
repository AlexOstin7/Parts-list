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
import project.view.PartFilterView;

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
    public Long save(Part part) {
        em.persist(part);
        log.info("DAO save em.getId() before" + part.getId() + "part.toString" + part.toString());
        em.flush();
        log.info("DAO save em.getId() after" + part.getId() + "part.toString" + part.toString());
        return part.getId();
    }

    @Override
    public void remove(Part part) {
        em.remove(part);
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
//        if (criteria.list().get(0) == null)
//       log.info("criteria.list().get(0) ", criteria.list().get(0));
//        int min = (Integer)criteria.uniqueResult();
        int min = 0;
        if (!criteria.list().contains(null)) {
            min = (Integer) criteria.uniqueResult();
        }

//        List<String> results = criteria.list();
//        List<Integer> results = criteria.list();
//        List results = criteria.list();

//        log.info(" min list " + results);
//        projList.add(Projections.rowCount());

//        projList.add(Projections.property("component"));
//        projList.add(Projections.property("isNecessary"));
        //     projList.add(Projections.property("quantity"));
//        projList.add(Projections.max("quantity"));
//        projList.add(Projections.max("isNecessary"));

//        projList.add( Projections.property("isNecessary"), "Necessary");
//        projList.add( Restrictions.eq(Part.isNecessary(), "true"));
//        projList.add(Projections.countDistinct("isNecessary"));
//        projList.add(Projections.countDistinct("component"));
//        projList.add( Projections.groupProperty("quantity"));
//        projList.add( Restrictions.eq("isNecessary", true) );
//        projList.add( Projections.groupProperty("isNecessary"));


//        criteria.setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);

//
        /*List<Object> rows = criteria.list();
        for(Object r: rows){
            Object[] row = (Object[]) r;
            Type t = ((<String>) row[0]);
        }*/
        /*for(int i=0;i<results.size();i++){
log.info(" result " + i + " " + results.get(i));
            //            System.out.println(list.get(i));
        }*/
        /*Iterator iter = results.iterator();
        Object[] obj = (Object[]) iter.next();
        for (int i=0;i<obj.length;i++)
        {
//            System.out.println(obj[i]);
            log.info(" obj " + obj[i]);
        }*/


        /*CriteriaQuery<Long> countQuery = criteriaBuilder
                .createQuery(Long.class);

        countQuery.select(criteriaBuilder
                .count(countQuery.from(Part.class)));

        Long count = em.createQuery(countQuery)
                .getSingleResult();*/
//        session.close();
        return min;
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

//        Long count = getNubmerOfParts();
        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize);
            typedQuery.setMaxResults(pageSize);
//            System.out.println("Current page: " + typedQuery.getResultList());
            list = typedQuery.getResultList();
        }
        /*TypedQuery<Part> query = em.createQuery("SELECT p FROM Part p", Part.class);
        List<Part> list = loadAll();*/
        log.info("findPaginated dao before " + "size List " + list.size() + " count " + count + "page Number " + pageNumber + " list.toString " + list.toString());
        Page<Part> page = new PageImpl<>(list, pageable, count);
        log.info("findPaginated dao before " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
        return page;

    }

    @Override
    public Part findPaginatedOffset(Pageable pageable) {
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

//        Long count = getNubmerOfParts();
        int count = typedQuery.getResultList().size();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize + pageSize - 1);
            typedQuery.setMaxResults(1);
//            System.out.println("Current page: " + typedQuery.getResultList());
//            list = typedQuery.getResultList();

        }
//        Part part = typedQuery.getSingleResult();
        Part part = typedQuery.getResultList().stream().findFirst().orElse(null);
        /*TypedQuery<Part> query = em.createQuery("SELECT p FROM Part p", Part.class);
        List<Part> list = loadAll();*/
        log.info("findPaginated offset dao  " + "size List " + list.size() + " count " + count + "page Number " + pageNumber + "pageable.getPageNumber() " + pageable.getPageNumber() + " list.toString " + list.toString());
        if (part != null) {
            log.info("findPaginated dao  part " + part.toString());
        }
//        Page<Part> page = new PageImpl<>(list, pageable, count);
//        log.info("findPaginated dao before " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
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
//        Long count = getNubmerOfParts();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize + pageSize - 1);
            typedQuery.setMaxResults(1);
//            System.out.println("Current page: " + typedQuery.getResultList());
            list = typedQuery.getResultList();
        }
        Part part = typedQuery.getResultList().stream().findFirst().orElse(null);
        log.info("findPaginatedFilterOffset +necessare dao before " + "size List " + list.size() + " count " + count + "pageable.getPageNumber() " + pageable.getPageNumber() + "pageSize " + pageSize + " list.toString " + list.toString());
//        Page<Part> page = new PageImpl<>(list, pageable, count.intValue());
        Page<Part> page = new PageImpl<>(list, pageable, count);
        log.info("findPaginatedFilterOffset+ necessare dao after " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
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
        // select.where(criteriaBuilder.equal(from.get("component"), component));
        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
//        Long count = getNubmerOfParts();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize + pageSize - 1);
            typedQuery.setMaxResults(1);
//            System.out.println("Current page: " + typedQuery.getResultList());
            list = typedQuery.getResultList();
        }
        Part part = typedQuery.getResultList().stream().findFirst().orElse(null);
        log.info("findPaginatedFilterOffset +component dao before " + "size List " + list.size() + " count " + count + " pageable.getPageNumber() " + pageable.getPageNumber() + "page Number " + pageNumber + " pageSize " + pageSize + " list.toString " + list.toString());
//        Page<Part> page = new PageImpl<>(list, pageable, count.intValue());
        Page<Part> page = new PageImpl<>(list, pageable, count);
        log.info("findPaginatedFilterOffset +component  dao after " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
        return part;

    }

    @Override
    public Page<Part> findPaginated(Pageable pageable, boolean necessary) {
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

        select.where(criteriaBuilder.equal(from.get("isNecessary"), necessary));
        /*CriteriaQuery<Part> select = criteriaQuery.select(from);

        Root<Office> Office = criteria.from(Office.class);
        criteria.where(crbuilder.equal(Office.get("name"), name));*/

//        TypedQuery<Part> typedQuery = em.createQuery(select);
        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
//        Long count = getNubmerOfParts();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize);
            typedQuery.setMaxResults(pageSize);
//            System.out.println("Current page: " + typedQuery.getResultList());
            list = typedQuery.getResultList();
        }
        /*TypedQuery<Part> query = em.createQuery("SELECT p FROM Part p", Part.class);
        List<Part> list = loadAll();*/
        log.info("findPaginatedFilter necessare dao before " + "size List " + list.size() + " count " + count + "page Number " + pageNumber + " list.toString " + list.toString());
//        Page<Part> page = new PageImpl<>(list, pageable, count.intValue());
        Page<Part> page = new PageImpl<>(list, pageable, count);
        log.info("findPaginatedFilter necessare dao after " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
        return page;

    }


    @Override
    public Page<Part> findPaginated(Pageable pageable, String component) {
//        new PageRequest(pageable.getPageNumber(),pageable.getPageSize());
//        log.info("org serv before update " + part.toString());
//        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();

        CriteriaBuilder criteriaBuilder = em.getCriteriaBuilder();
        CriteriaQuery<Part> criteriaQuery = criteriaBuilder.createQuery(Part.class);
        Root<Part> from = criteriaQuery.from(Part.class);
        CriteriaQuery<Part> select = criteriaQuery.select(from);

//        select.where(criteriaBuilder.equal(from.get("component"), component));
        select.where(criteriaBuilder.like(from.get("component"), "%" + component + "%"));
        /*CriteriaQuery<Part> select = criteriaQuery.select(from);

        Root<Office> Office = criteria.from(Office.class);
        criteria.where(crbuilder.equal(Office.get("name"), name));*/

//        TypedQuery<Part> typedQuery = em.createQuery(select);
        TypedQuery<Part> typedQuery = em.createQuery(select);
        List<Part> list = Collections.emptyList();
        int count = typedQuery.getResultList().size();
//        Long count = getNubmerOfParts();
        int pageNumber = (int) ((count / pageSize) + 1);
        if (pageable.getPageNumber() < pageNumber) {
            typedQuery.setFirstResult(pageable.getPageNumber() * pageSize);
            typedQuery.setMaxResults(pageSize);
//            System.out.println("Current page: " + typedQuery.getResultList());
            list = typedQuery.getResultList();
        }
        /*TypedQuery<Part> query = em.createQuery("SELECT p FROM Part p", Part.class);
        List<Part> list = loadAll();*/
        log.info("findPaginatedFilter component dao before " + "size List " + list.size() + " count " + count + "page Number " + pageNumber + " list.toString " + list.toString());
//        Page<Part> page = new PageImpl<>(list, pageable, count.intValue());
        Page<Part> page = new PageImpl<>(list, pageable, count);
        log.info("findPaginatedFilter component dao after " + "page elements " + page.getTotalElements() + " page.toString " + page.toString() + " page content " + page.getContent().toString());
        return page;

    }
}