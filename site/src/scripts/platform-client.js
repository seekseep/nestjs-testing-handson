// `:::::platform`（remark-platform.mjs）の OS の切り替え。
// 切り替えの操作はナビゲーションバーの選択欄と `::platform-choice` のボタン。本文のブロックはタブを出さない。
// 選んだ OS は localStorage に残し、<html data-os="..."> に持つ。表示の出し分けは platform.css に任せる。
// <head> で読み込まれるので、属性だけは本文の描画前に付けてちらつきを防ぐ。
(function () {
  var KEY = 'handson-os';
  var OSES = ['macos', 'windows', 'linux'];

  // まだ選んでいなければ、ブラウザの OS から推す（Windows のブラウザなら PowerShell の手順）
  function detect() {
    var ua = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    if (/mac|iphone|ipad/i.test(ua)) return 'macos';
    if (/win/i.test(ua)) return 'windows';
    if (/linux|x11|cros/i.test(ua)) return 'linux';
    return 'macos';
  }

  function load() {
    try {
      var saved = localStorage.getItem(KEY);
      if (OSES.indexOf(saved) >= 0) return saved;
    } catch (e) {
      // 読めない（プライベートウィンドウなど）ときは推した値を使う
    }
    return detect();
  }

  function normalize(value) {
    return OSES.indexOf(value) >= 0 ? value : load();
  }

  function apply(os, save) {
    document.documentElement.dataset.os = os;
    if (save) {
      try {
        localStorage.setItem(KEY, os);
      } catch (e) {
        // 保存できなくてもこのページ内の切り替えは効く。
      }
    }
    syncControls(os);
  }

  // ナビゲーションバーの選択欄と、::platform-choice のボタンの表示をそろえる。
  function syncControls(os) {
    document.querySelectorAll('handson-platform-select select').forEach(function (select) {
      select.value = os;
    });
    document.querySelectorAll('.platform-choice__option').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.platform === os ? 'true' : 'false');
    });
  }

  document.documentElement.dataset.os = load();

  function setup() {
    document.querySelectorAll('.platform-choice__option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(normalize(btn.dataset.platform), true);
      });
    });
    document.querySelectorAll('handson-platform-select select').forEach(function (select) {
      select.addEventListener('change', function () {
        apply(normalize(select.value), true);
      });
    });
    apply(load(), false);
  }

  // 別のタブで選び直したら、開いているほかのタブもそろえる
  window.addEventListener('storage', function (event) {
    if (event.key === KEY && OSES.indexOf(event.newValue) >= 0) apply(event.newValue, false);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
