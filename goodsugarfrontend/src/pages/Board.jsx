import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Filter } from 'lucide-react';
import '../styles/Board.css';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import axios from 'axios';

const Board = () => {
  const [boardButton, setBoardButton] = useState('snack');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');
  const [boardList, setBoardList] = useState([]);

  const categories = ['전체', '아이스크림', '음료', '과자', '빵', '과일', '기타'];
  const statuses = ['전체', '먹고 싶다', '먹음'];

  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        const response = await axios.get('http://localhost:12345/board');
        setBoardList(response.data);
      } catch (error) {
        console.error("데이터를 가져오는데 실패했습니다:", error);
      }
    };
    fetchAllBoards();
  }, []);

  const posts = [
    {
      id: 1,
      title: '초코 아이스크림',
      date: '2026. 2. 3.',
      category: '아이스크림',
      status: '먹음',
      content: '정말 맛있었어요!',
      details: '먹은 양: 1개 (100ml)',
      bloodSugar: '혈당 변화',
      bloodSugarData: {
        first: '145 mg/dL',
        second: '120 mg/dL',
        target: '95 mg/dL'
      },
      exer: '운동함',
      tasteRating: 5,
      healthRating: 3,
      writer: '당뇨관리왕',
      likes: 12,
      comments: 5
    },
    {
      id: 2,
      title: '카페라떼',
      date: '2026. 2. 2.',
      category: '음료',
      status: '먹고 싶다',
      content: '요즘 날씨가 추우니 따뜻한 라떼 한 잔이 너무 생각나요. 혈당 관리하면서 마실 수 있을까요?',
      note: '연쇄가 먹어보고 싶은 간식입니다 ✨',
      allergyInfo: '약명',
      likes: 8,
      comments: 3
    },
    {
      id: 3,
      title: '허니버터칩',
      date: '2026. 2. 1.',
      category: '과자',
      status: '먹음',
      content: '적당량만 먹으니 괜찮았습니다',
      exer: '운동 안함',
      bloodSugarNote: '건강 정보가 비교가 차리되었습니다',
      warningType: '혈당 변화',
      warningDetail: '무름',
      writer: '건강챙기기',
      likes: 6,
      comments: 2
    }
  ];

  const filteredPosts = posts.filter(post => {
    const categoryMatch = selectedCategory === '전체' || post.category === selectedCategory;
    const statusMatch = selectedStatus === '전체' || post.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
        ★
      </span>
    ));
  };



  return (

    <div className="board">
      <div className="container">
        <Tabs>
          <TabList className="board-tablist">
            <Tab>
              <button onClick={() => setBoardButton('snack')} className={`board-button ${boardButton === 'snack' ? 'board-button-active' : ''}`}>
                🍪 간식 게시판
              </button>
            </Tab>
            <Tab>
              <button onClick={() => setBoardButton('free')} className={`board-button ${boardButton === 'free' ? 'board-button-active' : ''}`}>
                💬 자유 게시판
              </button>
            </Tab>
            <Tab>
              <button onClick={() => setBoardButton('good')} className={`board-button ${boardButton === 'good' ? 'board-button-active' : ''}`}>
                😋 당뇨식 추천 게시판
              </button>
            </Tab>
          </TabList>

          <TabPanel>
            <div className="board-content">
              <div className="content-header">
                <h2 className="page-title">간식 게시판</h2>
                <div className="action-buttons">
                  <button className="action-button create-button">
                    게시글 작성
                  </button>
                </div>
              </div>

              {/* 필터 */}
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

              {/* 게시판 글 */}
              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <div key={post.id} className="post-card">
                    {/* 제목 */}
                    <div className="post-header">
                      <h3 className="post-title">{post.title}</h3>
                      <div className="post-stats">
                        <div className="stat">
                          <Heart size={18} className="icon-heart" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="stat">
                          <MessageCircle size={18} className="icon-comment" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>

                    <p className="post-date">📅 {post.date}</p>

                    {/* 태그 */}
                    <div className="post-tags">
                      <span className={`tag ${post.status === '먹음' ? 'tag-eaten' : 'tag-want'}`}>
                        {post.status}
                      </span>
                      <span className="tag tag-category">
                        {post.category}
                      </span>
                    </div>

                    {/* 내용 */}
                    <p className="post-content">{post.content}</p>

                    {/* 먹은 양 상세 */}
                    {post.details && (
                      <p className="post-details">{post.details}</p>
                    )}

                    {/* 혈당 변화 */}
                    {post.bloodSugar && (
                      <div className="blood-sugar">
                        <div className="blood-sugar-header">
                          <span className="warning-icon">📈</span>
                          <span className="blood-sugar-title">{post.bloodSugar}</span>
                        </div>
                        {post.bloodSugarData && (
                          <div className="blood-sugar-data">
                            <p>1시간: {post.bloodSugarData.first}</p>
                            <p>2시간: {post.bloodSugarData.second}</p>
                            <p>공복: {post.bloodSugarData.target}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 운동 여부*/}
                    {post.exer && post.status === '먹음' && (
                      <div className="exer">
                        <span>⚡ {post.exer}</span>
                      </div>
                    )}

                    {/* Note */}
                    {post.note && (
                      <p className="post-note">{post.note}</p>
                    )}

                    {/* Ratings */}
                    {post.tasteRating && (
                      <div className="ratings">
                        <div className="rating-row">
                          <span className="rating-label">맛 평가</span>
                          <div className="stars">{renderStars(post.tasteRating)}</div>
                        </div>
                        {post.healthRating && (
                          <div className="rating-row">
                            <span className="rating-label">건강 평가</span>
                            <div className="stars">{renderStars(post.healthRating)}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="post-footer">
                      <p className="post-writer">
                        작성자: {post.writer || post.allergyInfo}
                      </p>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </TabPanel>
          <TabPanel>

            <div className="board-content">
              <div className="content-header">
                <h2 className="page-title">자유 게시판</h2>
                <div className="action-buttons">
                  <button className="action-button create-button">게시글 작성</button>
                </div>
              </div>

              <div className="posts-grid">
                {/* 데이터가 없을 경우를 대비한 처리 */}
                {boardList && boardList.length > 0 ? (
                  boardList.map((post) => (
                    <div key={post.boardId} className="post-card">
                      <div className="post-header">
                        <h3 className="post-title">{post.boardTitle}</h3>
                        <span>조회수: {post.boardViewCount}</span>
                      </div>

                      <p className="post-date">📅 {post.boardCreate}</p>


                      <p className="post-content">{post.boardContents || post.boardContent}</p>

                      <div className="post-footer">
                        <p className="post-writer">
                          작성자: {post.isAnonymousYn === 'Y' ? '익명' : post.nickname}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">게시글이 없습니다.</p>
                )}
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="board-content">
              <div className="content-header">
                <h2 className="page-title">당뇨식 추천 게시판</h2>
                <div className="action-buttons">
                  <button className="action-button create-button">
                    게시글 작성
                  </button>
                </div>
              </div>
            </div>

          </TabPanel>
        </Tabs>

      </div>
    </div>
  );
};

export default Board;
