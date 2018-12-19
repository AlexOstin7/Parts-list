package project.advice;


import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.ModelAndView;
import project.exception.CustomErrorException;
import project.message.Response;
import project.message.ResponseError;
import project.message.ResponseSuccess;

import java.security.NoSuchAlgorithmException;

@RestControllerAdvice
public class WebRestControllerAdvice {

	@ExceptionHandler(CustomErrorException.class)
	public Response handleResponseException(CustomErrorException ex) {
		Response error = new ResponseError(ex.getMessage());
		return error;
	}

}