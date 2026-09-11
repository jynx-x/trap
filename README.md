# 🚨 TRAP ESCAPE

함정에 빠졌다! 3개의 미션을 완료하고 탈출하라.
1~3분짜리 픽셀 판타지 RPG 미니게임 — 클릭(터치)만으로 플레이.

```
평화로운 월드 → 🚨 EMERGENCY → 함정 → 3개의 미션 → 🔓 PUSH TO ESCAPE → 🎉 MISSION CLEAR
```

## Missions

| # | Mission | 방법 |
|---|---------|------|
| 01 | FIND THE KEY 🔑 | 던전 곳곳의 오브젝트를 클릭해 숨겨진 열쇠 찾기 |
| 02 | CUT THE WIRES 💣 | 메모 힌트를 보고 올바른 전선 끊기 |
| 03 | OPEN THE LOCK 🔐 | 벽 석판의 순서대로 룬 입력 |

틀려도 게임오버는 없습니다. (하트만 조금 줄어요)

## Tech

- 순수 HTML / CSS / JavaScript — 빌드, 서버, 외부 이미지 없음
- 모든 픽셀 아트는 런타임에 캔버스로 한 픽셀씩 그려서 생성 (`js/sprites*.js`)
- 모든 효과음과 BGM은 WebAudio 칩튠 신디사이저로 실시간 생성 (`js/audio.js`)
- 폰트: [Galmuri](https://github.com/quiple/galmuri), Press Start 2P

## Run

`index.html`을 브라우저로 열면 끝. GitHub Pages로 그대로 배포할 수 있습니다.
