export function loadKakaoSdk(appKey) {
  return new Promise((resolve, reject) => {
    if (!appKey) return reject(new Error("VITE_KAKAO_APPKEY is missing"));
    if (window.kakao && window.kakao.maps) return resolve(true);

    const existing = document.querySelector("script[data-kakao-sdk='1']");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.dataset.kakaoSdk = "1";
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => resolve(true));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
