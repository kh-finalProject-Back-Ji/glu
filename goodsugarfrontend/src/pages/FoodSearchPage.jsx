import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import FoodDetailModal from "../components/food/FoodDetailModal";
import "../styles/FoodSearchPage.css";

const PAGE_SIZE = 60;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function makePageButtons(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  // 1 ... (cur-1 cur cur+1) ... total
  const set = new Set([1, total, cur - 1, cur, cur + 1]);
  const arr = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
    if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push(-1);
  }
  return out;
}

export default function FoodSearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const q = (params.get("q") ?? "").trim();
  const pageParam = Number(params.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [input, setInput] = useState(q);

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => setInput(q), [q]);

  // ✅ 검색
  useEffect(() => {
    if (!q) {
      setItems([]);
      setTotalCount(0);
      setTotalPages(1);
      setErrorMsg("");
      return;
    }

    let alive = true;

    (async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await api.get(`/api/foods`, {
          params: { query: q, page, size: PAGE_SIZE },
        });

        if (!alive) return;

        const data = res.data ?? {};
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotalCount(Number(data.totalCount ?? 0) || 0);
        setTotalPages(Math.max(1, Number(data.totalPages ?? 1) || 1));
      } catch (e) {
        if (!alive) return;
        console.error("[SEARCH ERROR]", e);
        setErrorMsg("검색 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
        setItems([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [q, page]);

  const submitSearch = (e) => {
    e.preventDefault();
    const keyword = input.trim();
    if (!keyword) return;
    setParams({ q: keyword, page: "1" });
  };

  const goPage = (p) => {
    if (!q) return;
    const next = clamp(p, 1, totalPages);
    setParams({ q, page: String(next) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ 상세
  const openDetail = async (item) => {
    if (!item?.foodCd) return;

    setSelected(item);
    setOpen(true);
    setDetail(null);
    setDetailLoading(true);

    // name은 optional로 보냄(있으면 fallback에 도움됨)
    const nameForReq = item?.name ?? "";

    try {
      const res = await api.get(
        `/api/foods/${encodeURIComponent(item.foodCd)}`,
        { params: { name: nameForReq } }
      );
      setDetail(res.data ?? null);
    } catch (e) {
      console.error("[DETAIL ERROR]", e?.response?.status, e?.response?.data, e);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const metaLeft = useMemo(() => {
    if (!q) return "검색어를 입력하면 식품 목록이 표시됩니다.";
    return `검색 식품 (${totalCount}개)`;
  }, [q, totalCount]);

  const pageBtns = useMemo(() => {
    const cur = clamp(page, 1, totalPages);
    return makePageButtons(cur, totalPages);
  }, [page, totalPages]);

  return (
    <div className="food-page">
      {/* ✅ 검색 전용 헤더 (공통 헤더랑 느낌 다르게: 화이트) */}
      <header className="food-headerSearch">
        <div className="food-headerSearch__inner">
          <div className="food-title" onClick={() => navigate("/")}>
            식품 검색
          </div>

          <form className="food-searchWide" onSubmit={submitSearch}>
            <div className="food-searchWide__box">
              <span className="food-searchWide__icon" aria-hidden="true">
                🔎
              </span>

              <input
                className="food-searchWide__input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="예: 떡볶이, 국밥, 김치찌개…"
                spellCheck={false}
              />

              {input.trim() && (
                <button
                  type="button"
                  className="food-searchWide__clear"
                  onClick={() => setInput("")}
                  aria-label="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>

            <button className="food-searchWide__btn" type="submit">
              검색
            </button>
          </form>
        </div>
      </header>

      <main className="food-main">
        {/* ✅ 상단 메타 줄 */}
        <div className="food-metaRow">
          <div className="food-metaRow__left">{metaLeft}</div>
          <div className="food-metaRow__right">100g 기준</div>
        </div>

        {errorMsg && <div className="food-alert">{errorMsg}</div>}

        {loading ? (
          <div className="food-skeleton">
            <div className="food-skeleton__title">검색 중…</div>
            <div className="food-skeleton__grid">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="food-skeleton__pill" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {q && items.length === 0 ? (
              <div className="food-empty">
                <div className="food-empty__emoji">🍽️</div>
                <div className="food-empty__title">결과가 없어요</div>
                <div className="food-empty__desc">
                  다른 키워드로 다시 검색해 보세요.
                </div>
              </div>
            ) : (
              <>
                {/* ✅ 결과 카드 */}
                <div className="food-grid">
                  {items.map((it) => (
                    <button
                      key={it.foodCd}
                      className="food-card"
                      type="button"
                      onClick={() => openDetail(it)}
                      title={it.name}
                    >
                      <div className="food-card__name">{it.name}</div>
                      <div className="food-card__footer">
                        <span className="food-card__chip">상세 보기</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* ✅ 페이지네이션: 맨 아래 */}
                {q && totalPages > 1 && (
                  <nav className="food-pagerBottom" aria-label="페이지네이션">
                    <button
                      type="button"
                      className="food-pagerBottom__btn"
                      onClick={() => goPage(page - 1)}
                      disabled={page <= 1}
                    >
                      이전
                    </button>

                    <div className="food-pagerBottom__nums">
                      {pageBtns.map((p, idx) =>
                        p === -1 ? (
                          <span className="food-pagerBottom__dots" key={`d-${idx}`}>
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            className={
                              "food-pagerBottom__num" + (p === page ? " is-active" : "")
                            }
                            onClick={() => goPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      className="food-pagerBottom__btn"
                      onClick={() => goPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      다음
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </main>

      <FoodDetailModal
        open={open}
        onClose={() => setOpen(false)}
        item={selected}
        loading={detailLoading}
        detail={detail}
      />
    </div>
  );
}
