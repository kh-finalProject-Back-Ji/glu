package edu.kh.eightgyosi.mypage.model.service;

import java.util.List;

import edu.kh.eightgyosi.mypage.model.dto.WrongNoteDTO;

public interface WrongNoteService {

	List<WrongNoteDTO> selectWrongNote(int memberNo);

	int insertWrongNote(WrongNoteDTO wrongNote);

}
