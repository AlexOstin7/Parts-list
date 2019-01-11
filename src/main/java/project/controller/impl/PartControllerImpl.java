package project.controller.impl;

import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import project.controller.PartController;
import project.exception.CustomErrorException;
import project.message.Response;
import project.message.ResponseSuccess;
import project.model.Part;
import project.service.PartService;
import project.view.PartView;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
@RequestMapping(value = "/part", produces = APPLICATION_JSON_VALUE)
public class PartControllerImpl implements PartController {

    private final PartService partService;
    private final Logger log = LoggerFactory.getLogger(PartControllerImpl.class);

    @Autowired
    public PartControllerImpl(PartService partService) {
        this.partService = partService;
    }

    @Override
    @ApiOperation(value = "add ", nickname = "add", httpMethod = "POST")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Success", response = String.class),
            @ApiResponse(code = 404, message = "Not Found"),
            @ApiResponse(code = 405, message = "Method Not Allowed"),
            @ApiResponse(code = 500, message = "Failure")})
    @RequestMapping(value = "/add", method = {POST})
    public Response addPart(@RequestBody PartView part) {
        if (part == null) {
            throw new CustomErrorException("Part is null");
        }
        return new ResponseSuccess("success", partService.addPart(part));
    }

    @Override
    @ApiOperation(value = "deletePartById", nickname = "deletePartById", httpMethod = "POST")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Success", response = String.class),
            @ApiResponse(code = 404, message = "Not Found"),
            @ApiResponse(code = 405, message = "Method Not Allowed"),
            @ApiResponse(code = 500, message = "Failure")})
    @RequestMapping(value = "/delete/{id}", method = {GET})
    public Response deletePart(@PathVariable(value = "id") Long id) {
        if (id == null) {
            throw new CustomErrorException("Id is null");
        }
        partService.deletePart(id);
        return new ResponseSuccess("success");
    }

    @Override
    @ApiOperation(value = "getPartById", nickname = "getPartById", httpMethod = "GET")
    @RequestMapping(value = "/{id}", method = {GET})
    public Response getPartById(@PathVariable(value = "id") Long id) {
        if (id == null) {
            throw new CustomErrorException("Id is null");
        }
        return new ResponseSuccess("success", partService.getPartById(id));
    }

    @Override
    @ApiOperation(value = "updatePart", nickname = "updatePart", httpMethod = "POST")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Success", response = String.class),
            @ApiResponse(code = 404, message = "Not Found"),
            @ApiResponse(code = 405, message = "Method Not Allowed"),
            @ApiResponse(code = 500, message = "Failure")})
    @RequestMapping(value = "/update", method = {POST})
    public Response updatePart(@RequestBody PartView part) {
        if (part == null) {
            throw new CustomErrorException("Part is null");
        }
        partService.updatePart(part);
        return new ResponseSuccess("success");
    }

    @Override
    @ApiOperation(value = "findPaginated", nickname = "findPaginated", httpMethod = "GET")
    @RequestMapping(value = "/get", params = {"page", "size"}, method = {GET})
    public Response findPaginated(@RequestParam("page") int page, @RequestParam("size") int size) {
        Page<Part> resultPage = partService.findPaginated(page, size);
        if (page > resultPage.getTotalPages()) {
            throw new CustomErrorException("Page number error");
        }
        return new ResponseSuccess("success", resultPage);
    }

    @Override
    @ApiOperation(value = "findPaginatedOffset", nickname = "findPaginatedOffset", httpMethod = "GET")
    @RequestMapping(value = "/getoffset", params = {"page", "size"}, method = {GET})
    public Response findPaginatedByOffset(@RequestParam("page") int page, @RequestParam("size") int size) {
        Part part = partService.findPaginatedOffset(page, size);
        if (part == null) {
            throw new CustomErrorException("next Page number error");
        }
        return new ResponseSuccess("success", part);
    }

    @Override
    @ApiOperation(value = "findPaginatedOffset", nickname = "findPaginatedOffset", httpMethod = "GET")
    @RequestMapping(value = "/getoffset", params = {"page", "size", "necessary"}, method = {GET})
    public Response findPaginatedByOffset(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("necessary") boolean necessary) {
        Part part = partService.findPaginatedOffset(page, size, necessary);
        if (part == null) {
            throw new CustomErrorException("next Page number error");
        }
        return new ResponseSuccess("success", part);
    }

    @Override
    @ApiOperation(value = "findPaginatedOffset", nickname = "findPaginatedOffset", httpMethod = "GET")
    @RequestMapping(value = "/getoffset", params = {"page", "size", "component"}, method = {GET})
    public Response findPaginatedByOffset(@RequestParam("page") int page, @RequestParam("size") int size, @RequestParam("component") String component) {
        Part part = partService.findPaginatedOffset(page, size, component);
        if (part == null) {
            throw new CustomErrorException("next Page number error");
        }
        return new ResponseSuccess("success", part);
    }

    @Override
    @ApiOperation(value = "findPaginatedFilterNecessary", nickname = "findPaginatedFilterNecessary", httpMethod = "GET")
    @RequestMapping(value = "/getnecessary", params = {"page", "size", "necessary"}, method = {GET})
    public Response findPaginatedFilterNecessary(int page, int size, boolean necessary) {
        Page<Part> resultPage = partService.findPaginated(page, size, necessary);
        if (page > resultPage.getTotalPages()) {
            throw new CustomErrorException("Page number error");
        }
        return new ResponseSuccess("success", resultPage);
    }

    @Override
    @ApiOperation(value = "findPaginatedFilterComponent", nickname = "findPaginatedFilterComponent", httpMethod = "GET")
    @RequestMapping(value = "/getcomponent", params = {"page", "size", "component"}, method = {GET})
    public Response findPaginatedFilterComponent(int page, int size, String component) {
        Page<Part> resultPage = partService.findPaginated(page, size, component);
        if (page > resultPage.getTotalPages()) {
            throw new CustomErrorException("Page number error");
        }

        return new ResponseSuccess("success", resultPage);
    }

    @Override
    @ApiOperation(value = "getCountSets", nickname = "getCountSets", httpMethod = "GET")
    @RequestMapping(value = "/min", method = {GET})
    public Response getCountSets() {
        int res = 0;
        if (partService.getCountSets() != null) {
         res = partService.getCountSets();
        } else {
            throw new CustomErrorException("number is null");
        }
        return new ResponseSuccess("success", res);
    }
}
