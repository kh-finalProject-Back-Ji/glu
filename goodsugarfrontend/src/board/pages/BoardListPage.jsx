import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Container from "../components/common/Container";
import Loading from "../components/common/Loading";
import ErrorBox from "../components/common/ErrorBox";
import BoardFilters from "../components/board/BoardFilters";
import PostCard from "../components/board/PostCard";
import Pagination from "../components/common/Pagination";
import { BOARD_TYPES } from "../constants";
import { getBoardList } from "../api/boardApi";

function normalizeList(data) {
  const items = data?.items || data?.list || data?.content || data?.boards || [];
  const total = data?.total || data?.totalCount || data?.totalElements || items.length || 0;
  const page = data?.page || data?.currentPage || 1;
  const size = data?.size || data?.pageSize || items.length || 12;
  const totalPages = data?.totalPages || Math.max(1, Math.ceil(total / size));
  return { items, total, page, size, totalPages };
}

export default function BoardListPage() {
  const { type } = useParams();
  const safeType = BOARD_TYPES[type] ? type : "SNACK";

  const [filters, setFilters] = useState({
    q: "",
    status: "전체",
    sort: "latest",
    page: 1,
    size: 40, // ✅ 많이 나열 기본
  });

  const params = useMemo(
    () => ({
      type: safeType,
      q: filters.q || "",
      status: safeType === "SNACK" ? filters.status : undefined,
      sort: filters.sort,
      page: filters.page,
      size: filters.size,
    }),
    [filters, safeType]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["boards", params],
    queryFn: () => getBoardList(params),
  });

  const norm = useMemo(() => normalizeList(data), [data]);

  return (
    <Container>
      <div className="gs-pagehead">
        <div>
          <div className="gs-h1">{BOARD_TYPES[safeType].label}</div>
          <div className="gs-muted" style={{ marginTop: 4 }}>
            제목/하트/댓글을 강조해서 많이 나열합니다.
          </div>
        </div>

        <div className="gs-pagehead-actions">
          <Link className="gs-btn" to={`/boards/${safeType}/write`}>
            글쓰기
          </Link>
        </div>
      </div>

      <div className="gs-tabs">
        {Object.keys(BOARD_TYPES).map((t) => (
          <Link
            key={t}
            to={`/boards/${t}`}
            className={`gs-tab ${t === safeType ? "active" : ""}`}
          >
            {BOARD_TYPES[t].label}
          </Link>
        ))}
      </div>

      <BoardFilters type={safeType} value={filters} onChange={setFilters} />

      {isLoading && <Loading />}
      {isError && <ErrorBox message={String(error)} />}

      {!isLoading && !isError && (
        <>
          <div className="gs-grid">
            {norm.items.map((it) => (
              <PostCard key={it.boardId} type={safeType} item={it} />
            ))}
          </div>

          <Pagination
            page={filters.page}
            totalPages={norm.totalPages}
            onPage={(p) => setFilters((v) => ({ ...v, page: p }))}
          />
        </>
      )}
    </Container>
  );
}
