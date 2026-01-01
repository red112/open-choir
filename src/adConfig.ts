// 구글 애드센스 설정 파일

export const AD_CONFIG = {
    // 1. 내 게시자 ID (모든 광고 공통) - ca-pub- 뒤의 숫자 포함 전체
    CLIENT_ID: "ca-pub-3527723699056757",

    // 2. 광고 단위별 슬롯 ID (애드센스에서 발급받은 숫자)
    SLOTS: {
        // 목록 화면 중간중간 삽입되는 광고
        LIST_INFEED: "2762733359",

        // 목록 화면 맨 하단 광고
        LIST_FOOTER: "6253340081",

        // 게임 화면 하단 광고
        GAME_BOTTOM: "8055368730",

        // 텍스트 페이지(About, Guide, Terms 등) 하단 광고
        CONTENT_BOTTOM: "4940258417",
    }
};