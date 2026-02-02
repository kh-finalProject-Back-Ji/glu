$(document).ready(function () {

    const uploadUrl = '/editBoard/uploadFile';

    // Summernote 초기화
    $('#boardContent').summernote({
        placeholder: '내용을 입력하세요',
        height: 400,
        toolbar: [
            ['style', ['bold','italic','underline','clear']],
            ['font',['fontsize','color','fontname']],
            ['para',['ul','ol','paragraph']],
            ['insert',['link','picture','video']],
            ['view',['fullscreen','codeview']]
        ],
        callbacks: {
            onImageUpload: function(files) {
                for(let file of files){
                    uploadEditorFile(file, true);
                }
            }
        }
    });

    // Summernote 이미지/파일 업로드
    function uploadEditorFile(file, isImage=false){
        let formData = new FormData();
        formData.append("file", file);

        $.ajax({
            url: uploadUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(res){
                if(res.error){
                    alert('로그인이 필요합니다');
                    return;
                }

                if(isImage || file.type.startsWith("image/")){
                    $('#boardContent').summernote('insertImage', res.url);
                } else {
                    $('#boardContent').summernote(
                        'pasteHTML',
                        `<a href="${res.url}" target="_blank">${file.name}</a><br>`
                    );
                }
            },
            error: function(){ 
                alert('파일 업로드 실패'); 
            }
        });
    }

    // ================== 기존 이미지 삭제 ==================
    $(document).on('click', '.delete-image', function(){
        const imgNo = $(this).data('img-id'); 
        let current = $('#deleteImageIds').val();
        $('#deleteImageIds').val(current ? current + ',' + imgNo : imgNo);

        // 화면에서 제거
        $(this).closest('.boardImg-item').remove();
    });

    // ================== 기존 파일 삭제 ==================
    $(document).on('click', '.delete-file', function(){
        const fileNo = $(this).data('file-id'); 
        let current = $('#deleteFileIds').val();
        $('#deleteFileIds').val(current ? current + ',' + fileNo : fileNo);

        // 화면에서 제거
        $(this).closest('.boardFile-item').remove();
    });

    // ================== 폼 유효성 체크 ==================
    $('#boardForm').on('submit', function(){
        const title = $('input[name="boardTitle"]').val().trim();
        const content = $('#boardContent').summernote('code').trim();

        if(!title){
            alert('제목을 입력해주세요');
            return false;
        }
        if(!content || content === '<p><br></p>'){
            alert('내용을 입력해주세요');
            return false;
        }
    });
});


