import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Container from "../components/common/Container";
import { BOARD_TYPES } from "../constants";
import { createBoard } from "../api/boardApi";
import KakaoPlacePicker from "../components/board/KakaoPlacePicker";

export default function BoardWritePage() {
  const { type } = useParams();
  const safeType = BOARD_TYPES[type] ? type : "SNACK";
  const boardTypeId = BOARD_TYPES[safeType].id;

  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  // SNACK
  const [eatStatus, setEatStatus] = useState("먹음");
  const [snackType, setSnackType] = useState("");
  const [useMedicationYn, setUseMedicationYn] = useState("N");
  const [useInjectionYn, setUseInjectionYn] = useState("N");
  const [glucoseType, setGlucoseType] = useState("");
  const [glucoseValue, setGlucoseValue] = useState("");
  const [measureType, setMeasureType] = useState("");
  const [tasteScore, setTasteScore] = useState("");
  const [healthScore, setHealthScore] = useState("");

  // RECOMMEND
  const [place, setPlace] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [diabeticReason, setDiabeticReason] = useState("");

  // photos UI only (API 미구현일 수 있음)
  const [images, setImages] = useState([]);

  const payload = useMemo(() => {
    const base = {
      boardTypeId,
      title,
      content,
      isAnonymousYn: anonymous ? "Y" : "N",
    };

    if (boardTypeId === 1) {
      return {
        ...base,
        eatStatus,
        snackType,
        useMedicationYn,
        useInjectionYn,
        glucoseType: glucoseType || null,
        glucoseValue: glucoseValue ? Number(glucoseValue) : null,
        measureType: measureType || null,
        tasteScore: tasteScore ? Number(tasteScore) : null,
        healthScore: healthScore ? Number(healthScore) : null,
      };
    }

    if (boardTypeId === 3) {
      return {
        ...base,
        placeName: place?.placeName || null,
        address: place?.address || null,
        latitude: place?.latitude || null,
        longitude: place?.longitude || null,
        mapProvider: "KAKAO",
        placeUrl: place?.placeUrl || null,
        foodName,
        diabeticReason,
      };
    }

    return base;
  }, [
    anonymous,
    boardTypeId,
    content,
    diabeticReason,
    eatStatus,
    foodName,
    glucoseType,
    glucoseValue,
    healthScore,
    measureType,
    place,
    snackType,
    tasteScore,
    title,
    useInjectionYn,
    useMedicationYn,
  ]);

  const mut = useMutation({
    mutationFn: () => createBoard(payload),
    onSuccess: (res) => {
      const id = res?.boardId || res?.id;
      if (id) nav(`/boards/${safeType}/${id}`);
      else nav(`/boards/${safeType}`);
    },
    onError: (e) => alert(`작성 실패: ${e}`),
  });

  return (
    <Container>
      <div className="gs-breadcrumb">
        <Link className="gs-link" to={`/boards/${safeType}`}>← 목록</Link>
      </div>

      <div className="gs-card">
        <div className="gs-card-body">
          <div className="gs-h1">{BOARD_TYPES[safeType].label} 글쓰기</div>

          <div className="gs-form">
            <label className="gs-label">제목</label>
            <input className="gs-input" value={title} onChange={(e) => setTitle(e.target.value)} />

            <label className="gs-label">내용</label>
            <textarea className="gs-textarea" rows={10} value={content} onChange={(e) => setContent(e.target.value)} />

            <label className="gs-check" style={{ marginTop: 8 }}>
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              익명 작성
            </label>

            <div className="gs-subcard" style={{ marginTop: 12 }}>
              <div className="gs-title">사진 업로드</div>
              <div className="gs-muted" style={{ marginTop: 6 }}>
                백엔드에 게시판 이미지 업로드 API가 없으면 업로드는 동작하지 않습니다. (UI만 준비됨)
              </div>
              <input type="file" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} style={{ marginTop: 10 }} />
              {images.length > 0 && (
                <div className="gs-muted" style={{ marginTop: 8 }}>
                  선택됨: {images.map((f) => f.name).join(", ")}
                </div>
              )}
            </div>

            {boardTypeId === 1 && (
              <div className="gs-subcard" style={{ marginTop: 12 }}>
                <div className="gs-title">간식 상세</div>

                <div className="gs-grid-2" style={{ marginTop: 12 }}>
                  <div>
                    <div className="gs-label">먹음/안먹음</div>
                    <select className="gs-select" value={eatStatus} onChange={(e) => setEatStatus(e.target.value)}>
                      <option value="먹음">먹음</option>
                      <option value="먹고싶다">안먹음</option>
                    </select>
                  </div>

                  <div>
                    <div className="gs-label">간식 종류</div>
                    <input className="gs-input" value={snackType} onChange={(e) => setSnackType(e.target.value)} placeholder="예) 과자, 아이스크림" />
                  </div>

                  <div>
                    <div className="gs-label">약 복용</div>
                    <select className="gs-select" value={useMedicationYn} onChange={(e) => setUseMedicationYn(e.target.value)}>
                      <option value="N">아니오</option>
                      <option value="Y">예</option>
                    </select>
                  </div>

                  <div>
                    <div className="gs-label">주사</div>
                    <select className="gs-select" value={useInjectionYn} onChange={(e) => setUseInjectionYn(e.target.value)}>
                      <option value="N">아니오</option>
                      <option value="Y">예</option>
                    </select>
                  </div>

                  <div>
                    <div className="gs-label">혈당 타입</div>
                    <input className="gs-input" value={glucoseType} onChange={(e) => setGlucoseType(e.target.value)} placeholder="예) 공복/식후" />
                  </div>

                  <div>
                    <div className="gs-label">혈당 수치</div>
                    <input className="gs-input" value={glucoseValue} onChange={(e) => setGlucoseValue(e.target.value)} placeholder="예) 120" />
                  </div>

                  <div>
                    <div className="gs-label">측정 타입</div>
                    <input className="gs-input" value={measureType} onChange={(e) => setMeasureType(e.target.value)} placeholder="예) 자가측정" />
                  </div>

                  <div>
                    <div className="gs-label">맛 점수 (1~5)</div>
                    <input className="gs-input" value={tasteScore} onChange={(e) => setTasteScore(e.target.value)} placeholder="예) 4" />
                  </div>

                  <div>
                    <div className="gs-label">건강 점수 (1~5)</div>
                    <input className="gs-input" value={healthScore} onChange={(e) => setHealthScore(e.target.value)} placeholder="예) 3" />
                  </div>
                </div>
              </div>
            )}

            {boardTypeId === 3 && (
              <>
                <KakaoPlacePicker value={place} onChange={setPlace} />

                <div className="gs-subcard" style={{ marginTop: 12 }}>
                  <div className="gs-title">추천 정보</div>

                  <div className="gs-grid-2" style={{ marginTop: 12 }}>
                    <div>
                      <div className="gs-label">음식 이름</div>
                      <input className="gs-input" value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="예) 닭가슴살 샐러드" />
                    </div>

                    <div>
                      <div className="gs-label">당뇨식 추천 이유</div>
                      <input className="gs-input" value={diabeticReason} onChange={(e) => setDiabeticReason(e.target.value)} placeholder="예) 당이 낮고 단백질 많음" />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="gs-row" style={{ marginTop: 16 }}>
              <button
                className="gs-btn"
                onClick={() => {
                  if (!title.trim()) return alert("제목을 입력하세요.");
                  if (!content.trim()) return alert("내용을 입력하세요.");
                  if (boardTypeId === 3 && !place) return alert("추천 게시판은 장소를 선택하세요.");
                  mut.mutate();
                }}
                disabled={mut.isPending}
              >
                등록
              </button>

              <Link className="gs-btn gs-btn-outline" to={`/boards/${safeType}`}>
                취소
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
