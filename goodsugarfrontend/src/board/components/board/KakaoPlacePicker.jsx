import { useEffect, useMemo, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { loadKakaoSdk } from "../../utils/kakao";

export default function KakaoPlacePicker({ value, onChange }) {
  const appKey = import.meta.env.VITE_KAKAO_APPKEY;

  const [ready, setReady] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const [center, setCenter] = useState({
    lat: value?.latitude || 37.5665,
    lng: value?.longitude || 126.978,
  });

  useEffect(() => {
    loadKakaoSdk(appKey)
      .then(() => setReady(true))
      .catch((e) => {
        console.error(e);
        setReady(false);
      });
  }, [appKey]);

  const selected = value?.placeName ? value : null;

  const search = () => {
    if (!ready) return alert("카카오맵 SDK 로딩 실패. 키를 확인하세요.");
    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status !== kakao.maps.services.Status.OK) {
        setResults([]);
        return;
      }
      setResults(data);
    });
  };

  const pick = (p) => {
    const next = {
      placeName: p.place_name,
      address: p.road_address_name || p.address_name,
      latitude: Number(p.y),
      longitude: Number(p.x),
      mapProvider: "KAKAO",
      placeUrl: p.place_url,
    };
    onChange(next);
    setCenter({ lat: next.latitude, lng: next.longitude });
  };

  const markerPos = useMemo(() => {
    if (!selected) return null;
    return { lat: selected.latitude, lng: selected.longitude };
  }, [selected]);

  return (
    <div className="gs-card" style={{ marginTop: 12 }}>
      <div className="gs-card-body">
        <div className="gs-title">지도/장소 선택 (카카오)</div>

        <div className="gs-row" style={{ marginTop: 12 }}>
          <input
            className="gs-input"
            placeholder="예) 강남역 맛집"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="gs-btn" onClick={search}>
            검색
          </button>
        </div>

        <div className="gs-grid-2" style={{ marginTop: 12 }}>
          <div className="gs-listbox">
            {results.map((r) => (
              <button key={r.id} className="gs-listitem" onClick={() => pick(r)}>
                <div className="gs-listitem-title">{r.place_name}</div>
                <div className="gs-muted" style={{ fontSize: 12 }}>
                  {r.road_address_name || r.address_name}
                </div>
              </button>
            ))}
            {results.length === 0 && <div className="gs-muted">검색 결과가 여기에 표시돼요.</div>}
          </div>

          <div className="gs-mapbox">
            <Map center={center} style={{ width: "100%", height: "280px", borderRadius: 12 }} level={4}>
              {markerPos && <MapMarker position={markerPos} />}
            </Map>

            {selected && (
              <div className="gs-muted" style={{ marginTop: 8 }}>
                선택: <b>{selected.placeName}</b> · {selected.address}
              </div>
            )}
          </div>
        </div>

        <div className="gs-muted" style={{ marginTop: 8 }}>
          ※ `.env`에 <b>VITE_KAKAO_APPKEY</b> 설정 필요
        </div>
      </div>
    </div>
  );
}
