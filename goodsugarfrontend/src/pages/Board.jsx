import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Filter } from 'lucide-react';
import '../styles/Board.css';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import axios from 'axios';
import BoardModal from '../components/common/BoardModal';

const Board = () => {
  const [boardButton, setBoardButton] = useState('snack');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [boardList, setBoardList] = useState([]);
  const statuses = ['전체', '먹고 싶다', '먹음'];
  const [isModal, setIsModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  const fetchAllBoards = async () => {
    try {
      const response = await axios.get('http://localhost:12345/board');
      setBoardList(response.data);
    } catch (error) {
      console.error("데이터를 가져오는데 실패했습니다:", error);
    }
  };

  useEffect(() => {
    fetchAllBoards();
  }, []);

  const modalViewToggle = () => setIsModal(!isModal);

  const getMemberIdFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(window.atob(base64));
      return decodedPayload.sub;
    } catch (e) {
      console.error("토큰 해독 실패:", e);
      return null;
    }
  };

  const handleCreateButtonClick = () => {
    const memberId = getMemberIdFromToken();
    if (!memberId) {
      alert("로그인 이후 이용해주세요. 🔒");
      return;
    }
    setModalMode("create");
    modalViewToggle();
  };

  const createBoard = async (data) => {
    const memberId = getMemberIdFromToken();
    if (!memberId) {
      alert("로그인 세션이 만료되었습니다.");
      return;
    }

    // 💡 '먹고 싶다'일 경우 서버에 보낼 데이터 정제
    const isWanting = data.status === '먹고 싶다';

    const boardData = {
      boardTitle: data.title,
      boardContent: data.contents,
      details: data.details,
      fastingGlu: isWanting ? 0 : data.fastingGlu,
      bloodSugarF: isWanting ? 0 : data.bloodSugarF,
      bloodSugarS: isWanting ? 0 : data.bloodSugarS,
      exer: isWanting ? 'N' : data.exer,
      tasterating: isWanting ? 0 : (data.tasterating || 3),
      boardTypeId: boardButton === 'snack' ? 2 : 1,
      memberId: memberId
    };

    try {
      const response = await axios.post('http://localhost:12345/board', boardData);
      if (response.data > 0) {
        alert("기록되었습니다! 🍪");
        modalViewToggle();
        fetchAllBoards();
      }
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  const renderStars = (rating) => {
    // 별점이 0점이면 아예 표시하지 않거나 빈 별로 표시
    if (rating === 0) return <span>-</span>;
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>★</span>
    ));
  };

  return (
    <div className="board">
      <div className="container">
        <Tabs>
          <TabList className="board-tablist">
            <Tab><button onClick={() => setBoardButton('snack')} className={`board-button ${boardButton === 'snack' ? 'board-button-active' : ''}`}>🍪 간식 게시판</button></Tab>
            <Tab><button onClick={() => setBoardButton('free')} className={`board-button ${boardButton === 'free' ? 'board-button-active' : ''}`}>💬 자유 게시판</button></Tab>
            <Tab><button onClick={() => setBoardButton('good')} className={`board-button ${boardButton === 'good' ? 'board-button-active' : ''}`}>😋 추천 게시판</button></Tab>
          </TabList>

          <BoardModal 
            isModal={isModal} 
            modalViewToggle={modalViewToggle} 
            createBoard={createBoard}
            mode={modalMode}
            message={boardButton === 'snack' ? "간식" : "자유"}
          />

          <TabPanel>
            <div className="board-content">
              <div className="content-header">
                <h2 className="page-title">간식 게시판</h2>
                <div className="action-buttons">
                  <button className="action-button create-button" onClick={handleCreateButtonClick}>게시글 작성</button>
                </div>
              </div>

              <div className="filter-section">
                <div className="filter-header">
                  <Filter size={20} />
                  <h3>필터</h3>
                </div>
                <div className="filter-grid">
                  <div className="filter-group">
                    <p className="filter-label">상태</p>
                    <div className="filter-options">
                      {statuses.map(status => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`filter-chip ${selectedStatus === status ? 'filter-chip-active' : ''}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="posts-grid">
                {(() => {
                  const snackPosts = boardList.filter(post => post.snackId !== 0);
                  const filteredPosts = snackPosts.filter(post => {
                    if (selectedStatus === '전체') return true;
                    // 혈당 데이터 유무로 먹음/먹고싶다 판단
                    const isEaten = post.bloodSugarF > 0 || post.bloodSugarS > 0 || post.fastingGlu > 0;
                    return selectedStatus === '먹음' ? isEaten : !isEaten;
                  });

                  return filteredPosts.length > 0 ? (
                    filteredPosts.map(post => {
                      // 💡 여기서 먹었는지 여부를 체크합니다.
                      const isEaten = post.bloodSugarF > 0 || post.bloodSugarS > 0 || post.fastingGlu > 0;

                      return (
                        <div key={post.boardId} className="post-card">
                          <div className="post-header">
                            <h3 className="post-title">{post.boardTitle}</h3>
                            <div className="post-stats">
                              <div className="stat"><Heart size={18} /> <span>{post.likes || 0}</span></div>
                              <div className="stat"><MessageCircle size={18} /> <span>{post.comments || 0}</span></div>
                            </div>
                          </div>
                          <p className="post-date">📅 {post.boardCreate}</p>
                          
                          <div className="post-tags">
                            <span className={`tag ${isEaten ? 'tag-eaten' : 'tag-want'}`}>
                              {isEaten ? '먹음' : '먹고 싶다'}
                            </span>
                            <span className="tag tag-category">간식</span>
                          </div>

                          <p className="post-content">{post.boardContent}</p>
                          {post.details && <p className="post-details">📝 {post.details}</p>}
                          
                          {/* 💡 수정 포인트: 먹었을 때(isEaten)만 아래 정보들을 렌더링합니다. */}
                          {isEaten ? (
                            <>
                              <div className="blood-sugar">
                                <div className="blood-sugar-header">📈 <span className="blood-sugar-title">혈당 정보</span></div>
                                <div className="blood-sugar-data">
                                  <p>공복: {post.fastingGlu} mg/dL</p>
                                  <p>1시간: {post.bloodSugarF} mg/dL</p>
                                  <p>2시간: {post.bloodSugarS} mg/dL</p>
                                </div>
                              </div>
                              {post.exer && (
                                <div className="exer"><span>⚡ 운동 여부: {post.exer === 'Y' ? '운동함' : '안함'}</span></div>
                              )}
                              <div className="ratings">
                                <div className="rating-row">
                                  <span className="rating-label">맛 평가</span>
                                  <div className="stars">{renderStars(post.tasterating)}</div>
                                </div>
                              </div>
                            </>
                          ) : (
                            // '먹고 싶다'일 때 보여줄 간단한 영역 (필요 없으면 비워둬도 됨)
                            <div className="want-to-eat-box">
                              <p className="text-muted small italic">✨ 아직 먹기 전인 간식입니다.</p>
                            </div>
                          )}

                          <div className="post-footer">
                            <p className="post-writer">작성자: {post.nickname || '익명'}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-data">등록된 {selectedStatus} 기록이 없습니다.</p>
                  );
                })()}
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="board-content">
              <div className="content-header">
                <h2 className="page-title">자유 게시판</h2>
                <button className="action-button create-button" onClick={handleCreateButtonClick}>게시글 작성</button>
              </div>
              <div className="posts-grid">
                {boardList.filter(post => !post.snackId || post.snackId === 0).map((post) => (
                  <div key={post.boardId} className="post-card">
                    <div className="post-header">
                      <h3 className="post-title">{post.boardTitle}</h3>
                      <span>조회수: {post.boardViewCount}</span>
                    </div>
                    <p className="post-date">📅 {post.boardCreate}</p>
                    <p className="post-content">{post.boardContent}</p>
                    <div className="post-footer">
                      <p className="post-writer">작성자: {post.isAnonymousYn === 'Y' ? '익명' : post.nickname}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="board-content">
              <div className="content-header">
                <h2 className="page-title">당뇨식 추천 게시판</h2>
                <button className="action-button create-button" onClick={handleCreateButtonClick}>게시글 작성</button>
              </div>
              <p className="no-data">준비 중인 게시판입니다.</p>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default Board;