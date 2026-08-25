# npw-dashboard

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)


```sh


문제없습니다. node_modules와 dist는 다른 컴퓨터에서 다시 생성되는 폴더라 Git에 올리지 않는 것이 일반적입니다.
다른 컴퓨터에서 저장소를 받은 후 다음처럼 실행하면 됩니다.
git clone https://github.com/dsjisoopark-design/jisoo_home.git
cd jisoo_home
npm ci
npm run dev
역할은 다음과 같습니다.
node_modules: npm ci 실행 시 package-lock.json 기준으로 동일한 라이브러리가 자동 설치됩니다.
dist: 개발 실행에는 필요하지 않습니다. npm run build를 실행하면 다시 생성됩니다.
.codex-tmp: 작업용 임시 데이터라 필요 없습니다.
.vscode: 필수 실행 파일은 아니지만, 현재 extensions.json은 Git에 포함되어 있습니다.
필요 조건은 Node.js 22.18 이상 또는 24.12 이상입니다. 배포 파일까지 생성하려면 다음을 실행하면 됩니다.
npm ci
npm run build
인터넷이 완전히 차단된 컴퓨터라면 npm ci가 라이브러리를 내려받지 못하므로 별도 설치 패키지가 필요하지만, 일반적인 인터넷 연결 환경에서는 현재 GitHub 파일만으로 정상 실행됩니다.
npm run lint
```
