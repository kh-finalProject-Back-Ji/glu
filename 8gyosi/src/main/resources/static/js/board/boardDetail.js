/* boardDetail.js */
$(document).ready(function () {
    // ---------------------- 댓글 목록 -----------------------
    function loadComments() {
    $.ajax({
        url: `/editBoard/comment/${boardId}`,
        type: 'GET',
        success: function(comments) {
            const $list = $('#commentList'); 
            $list.empty();

            comments.forEach(c => {

                const canDelete = c.memberNo === loginMemberNo || sessionRole === 'ADMIN';
                let deleteBtn = canDelete ? `<button class="deleteCommentBtn" data-id="${c.commentNo}">삭제</button>` : '';
                

                const li = `
                    <li class="comment-row" id="comment-${c.commentNo}">
                        <div class="comment-header">
                            <span class="nickname"><strong>${c.memberNickname}</strong></span>
                            <span class="write-date">(${c.commentWriteDate})</span>
                        </div>
                        
                        <div class="comment-content">
                            <p>${c.commentContent}</p>
                        </div>

                        <div class="comment-footer">
                            ${deleteBtn}
                        </div>
                    </li>
                `;
                
                $list.append(li);
            });
        },
        error: function(err) {
            console.error('댓글 로딩 실패', err);
        }
    });
    }

    // 페이지 로딩 시 댓글 불러오기
    loadComments();

        // ---------------------- 댓글 작성 -----------------------
    $('#addCommentBtn').click(function() {
        const content = $('#commentContent').val().trim();
        if(!content) return alert('댓글 내용을 입력하세요');

        const obj = { 
            "commentContent" : content,
            "boardId" : boardId,
            "parentCommentNo": null
        };

        $.ajax({
            url: `/editBoard/comment/${boardId}`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(obj),
            success: function() {
                $('#commentContent').val('');
                location.reload(); 
            },
            error: function() {
                alert('댓글 작성 실패');
            }
        });
    });

    // ---------------------- 댓글 삭제 -----------------------
    $(document).on('click', '.deleteBtn', function() {
        const commentNo = $(this).data('comment-no');
        if (!confirm("정말 삭제하시겠습니까?")) return;

        $.ajax({
            url: `/editBoard/comment/${boardId}/${commentNo}`,
            type: "DELETE",
            success: function(e) {
                if (e.success || e > 0) {
                    alert("삭제되었습니다.");
                    location.reload();
                } else {
                    alert("삭제 실패");
                }
            }
        });
    });

    // ---------------------- 답글 창  -----------------------
    $(document).on('click', '.replyBtn', function() {
        const parentNo = $(this).data('comment-no');
        const $li = $(this).closest("li");

        if($(".reply-textarea").length > 0){
            if(!confirm("작성 중인 답글이 있습니다. 이어서 작성하시겠습니까?")) return;
            $(".reply-textarea, .reply-btns").remove();
        }

        const html = `
            <textarea class="reply-textarea" placeholder="답글을 입력하세요."></textarea>
            <div class="reply-btns">
                <button class="addReplyBtn" data-parent="${parentNo}">등록</button>
                <button class="cancelBtn">취소</button>
            </div>
        `;
        $li.append(html);
    });

    // ---------------------- 답글 등록  -----------------------
    $(document).on('click', '.addReplyBtn', function() {
        const parentNo = $(this).data('parent');
        const content = $(this).parent().prev(".reply-textarea").val();

        if(!content.trim()) return alert("내용을 입력해주세요.");

        $.ajax({
            url: `/editBoard/comment/${boardId}`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                "commentContent": content,
                "boardId": boardId,
                "parentCommentNo": parentNo
            }),
            success: function(res) {
                if(res > 0 || res.success) {
                    alert("답글이 등록되었습니다.");
                    location.reload();
                }
            }
        });
    });
        // ---------------------- 댓글 수정  -----------------------
    $(document).on('click', '.updateBtn', function() {
        const commentNo = $(this).data('comment-no');
        const $li = $(this).closest("li");
        const $content = $li.find(".comment-content");
        const originText = $content.text();
        $content.html(`<textarea class="edit-textarea">${originText}</textarea>`);

        $li.find(".comment-btn-area").html(`
            <button class="saveBtn" data-no="${commentNo}">등록</button>
            <button class="cancelBtn">취소</button>
        `);
    });
    // ------------------- 답글 수정 ----------------------
    $(document).on('click', '.saveBtn', function() {
        const commentNo = $(this).data('no');
        const newContent = $(this).closest("li").find(".edit-textarea").val();
        console.log("comment:", commentNo);
        if(!newContent.trim()) return alert("내용을 입력하세요.");

        $.ajax({
            url: "/editBoard/comment",
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                "commentNo": commentNo,
                "commentContent": newContent
            }),
            success: function(res) {
                if(res > 0 || res.success) {
                    alert("수정되었습니다.");
                    location.reload();
                }
            }
        });
    });
    // ---------------------- 취소 -----------------------
    $(document).on('click', '.cancelBtn', function() {
        if(confirm("작성을 취소하시겠습니까?")) {
            location.reload();
        }
    });

    // ------------------- 게시글 삭제 ---------------------
    $('#deleteBoardBtn').click(function() {
        if(!confirm("정말 삭제하시겠습니까?")) return;

        $.ajax({
            url: `/board/${boardTypeNo}/${boardId}/delete`,
            type: 'POST',
            success: function(res) {
                alert("게시글이 삭제되었습니다");
                window.location.href = `/board/${boardTypeNo}`;
            },
            error: function(err) {
                alert("게시글 삭제 실패");
                console.error(err);
            }
        });
    });
});

    // ---------------------- 좋아요  -----------------------
    document.querySelector("#boardLike").addEventListener("click", e => {
        const currentId = e.currentTarget.dataset.boardId || boardId;
        
    if (loginMemberNo == null) {
        alert("로그인 후 이용해주세요.");
        return;
    }

    const obj = {
        "memberNo": loginMemberNo,
        "boardId": currentId,
        "likeCheck": likeCheck
    };

    fetch("/board/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obj)
    })
        .then(resp => resp.text())
        .then(count => {

            if (count == -1) {
                console.log("좋아요 처리 실패");
                return;
            }
            const likeCountSpan = document.getElementById("likeCount");
            const heartIcon = document.getElementById("boardLike");

            // 좋아요 체크/해제 변경
            if (likeCheck == 0) { // 해체 상태일때
                heartIcon.classList.replace('fa-regular', 'fa-solid');
                likeCheck = 1; 
            } else { // 체크 상태일때
                heartIcon.classList.replace('fa-solid', 'fa-regular');
                likeCheck = 0; 
            }
    });
});