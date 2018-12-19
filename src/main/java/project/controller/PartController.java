package project.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import project.message.Response;
import project.view.PartView;

public interface PartController {

    Response addPart(@RequestBody PartView part);

    Response updatePart(@RequestBody PartView part);

    Response deletePart(@PathVariable("id") Long id);

    Response parts();

    Response getNumberOfParts();

    Response getPartById(@PathVariable("id") Long id) ;

    Response findPaginated(@RequestParam("page") int page, @RequestParam("size") int size);

 /*   Response filterParts(@RequestBody PartFilterView part);*/

}
