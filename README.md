# GIF Layout Editor - Stage 1

GitHub Pages에 바로 올려서 실행할 수 있는 1차 프로토타입입니다.

## 포함 기능
- 실시간 Canvas 미리보기
- 배경 / 왼쪽 이미지 / 오른쪽 이미지 업로드
- 말풍선 / 이름 / 상태문구 / 채팅 / 노래 정보 편집
- 반짝임 / 둥실 움직임 효과
- JPG 저장
- GIF 저장 (3초, 12fps)
- 서버 업로드 없이 브라우저에서만 처리

## GitHub Pages 배포
1. 압축을 풉니다.
2. `index.html`, `style.css`, `app.js`를 GitHub Pages 저장소 루트에 업로드합니다.
3. GitHub 저장소에서 `Settings > Pages`로 이동합니다.
4. 배포 브랜치를 `main` + `/root`로 설정합니다.
5. 배포된 URL을 열어 테스트합니다.

## 주의
- GIF 인코더는 jsDelivr CDN의 `gifenc` ES Module을 사용합니다.
- 네트워크가 차단된 환경에서는 GIF 기능이 작동하지 않을 수 있습니다.
- 고해상도 GIF는 브라우저 메모리를 많이 사용합니다. 1단계는 1200×675 / 3초 / 12fps로 고정되어 있습니다.

## 다음 단계 제안
- 각 레이어 드래그/리사이즈/회전
- 이미지 확대/크롭 위치 조절
- 템플릿 JSON 구조화
- 애니메이션 프리셋
- GIF 옵션(길이/FPS/해상도) 추가
