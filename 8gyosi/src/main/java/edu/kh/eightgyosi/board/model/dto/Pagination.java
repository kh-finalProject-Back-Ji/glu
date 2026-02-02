package edu.kh.eightgyosi.board.model.dto;


public class Pagination {
	private int currentPage;		// 현재 페이지 번호
	private int listCount;			// 전체 게시글 수
	
	private int limit = 10;			// 한 페이지 목록에 보여지는 게시글 수
	private int pageSize = 10;		// 보여질 페이지 번호 개수
	
	// 가장 첫페이지는 당연히 1페이지 -> 그래서 minPage는 따로없음
	private int maxPage;			// 마지막 페이지 번호
	private int startPage;			// 보여지는 맨 앞 페이지 번호
	private int endPage;			// 보여지는 맨 뒤 페이지 번호
	
	private int prevPage;			// 이전 레벨 페이지 모음의 마지막 번호("<" 클릭시)
	private int nextPage;			// 이전 레벨 페이지 모음의 첫 번호(">" 클릭시)
	
	
	
	public Pagination(int currentPage, int listCount) {
		super();
		this.currentPage = currentPage;
		this.listCount = listCount;
		
		calculate();
	}


	
	public Pagination(int currentPage, int listCount, int limit, int pageSize) {
		super();
		this.currentPage = currentPage;
		this.listCount = listCount;
		this.limit = limit;
		this.pageSize = pageSize;
		
		calculate();
	}


	// getter
	public int getCurrentPage() {
		return currentPage;
	}



	public int getListCount() {
		return listCount;
	}



	public int getLimit() {
		return limit;
	}



	public int getPageSize() {
		return pageSize;
	}



	public int getMaxPage() {
		return maxPage;
	}



	public int getStartPage() {
		return startPage;
	}



	public int getEndPage() {
		return endPage;
	}



	public int getPrevPage() {
		return prevPage;
	}



	public int getNextPage() {
		return nextPage;
	}


	// setter 
	public void setCurrentPage(int currentPage) {
		this.currentPage = currentPage;
		
		calculate();
	}



	public void setListCount(int listCount) {
		this.listCount = listCount;
		
		calculate();
	}



	public void setLimit(int limit) {
		this.limit = limit;
		
		calculate();
	}



	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
		
		calculate();
	}




	@Override
	public String toString() {
		return "pagination [currentPage=" + currentPage + ", listCount=" + listCount + ", limit=" + limit
				+ ", pageSize=" + pageSize + ", maxPage=" + maxPage + ", startPage=" + startPage + ", endPage="
				+ endPage + ", prevPage=" + prevPage + ", nextPage=" + nextPage + "]";
	}
	
	
	/** 페이징 처리에 필요한 값을 계산해서 필드에 대입하는 메서드
	 * (startPage, endPage, maxPage, prevPage, nextPage)
	 * 
	 */
	private void calculate() {
		
		maxPage = (int)Math.ceil( (double)listCount / limit);
		
		startPage = (currentPage -1) / pageSize * pageSize +1;
		
		endPage = pageSize -1 + startPage;
		
		if(endPage > maxPage) endPage = maxPage;
		
		if(currentPage <= pageSize) { // 1~10 페이지일시 1페이지로 이동
			prevPage = 1;
			
		} else {
			prevPage = startPage -1; // ex) 11페이지일때 "<" 클릭하면 10페이지로 이동
		}
		
		// 더 이상 다음으로 넘어갈 페이지가 없을 경우
		if(endPage == maxPage) { // 
			nextPage = maxPage;
					
		} else {
			nextPage = endPage + 1; // ex) 5페이지일때 ">" 클릭하면 11페이지로 이동 
			
		}
		
		
	}
	
}