import React, { useState } from 'react';
import { Heart, MessageCircle, Filter } from 'lucide-react';
import '../styles/Board.css';

const Board = () => {
  const [activeTab, setActiveTab] = useState('snack');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState('전체');

  const categories = ['전체', '아이스크림', '음료', '과자', '빵', '과일', '기타'];
  const statuses = ['전체', '먹고 싶다', '먹음'];

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
    <div className="snack-board">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🍪 Snack Board</h1>
          <button className="share-button">공유하기</button>
        </div>
      </header>

      <div className="container">
        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab('snack')}
            className={`tab ${activeTab === 'snack' ? 'tab-active' : ''}`}
          >
            🍰 간식 게시판
          </button>
          <button
            onClick={() => setActiveTab('free')}
            className={`tab ${activeTab === 'free' ? 'tab-active' : ''}`}
          >
            💬 자유 게시판
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="content-header">
            <h2 className="page-title">간식 게시판</h2>
            <div className="action-buttons">
              <button className="action-button activity-button">
                📊 활동 기록
              </button>
              <button className="action-button create-button">
                ➕ 게시글 작성
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-header">
              <Filter size={20} />
              <h3>필터</h3>
            </div>
            
            <div className="filter-grid">
              <div className="filter-group">
                <p className="filter-label">카테고리</p>
                <div className="filter-options">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`filter-chip ${selectedCategory === cat ? 'filter-chip-active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
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

          {/* Posts Grid */}
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <div key={post.id} className="post-card">
                {/* Post Header */}
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

                {/* Tags */}
                <div className="post-tags">
                  <span className={`tag ${post.status === '먹음' ? 'tag-eaten' : 'tag-want'}`}>
                    {post.status}
                  </span>
                  <span className="tag tag-category">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <p className="post-content">{post.content}</p>

                {/* Additional Info */}
                {post.details && (
                  <p className="post-details">{post.details}</p>
                )}

                {/* Blood Sugar Warning */}
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

                {/* Warning */}
                {post.warning && post.status === '먹음' && (
                  <div className="warning">
                    <span>⚡ {post.warning}</span>
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
      </div>
    </div>
  );
};

export default Board;
