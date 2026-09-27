/* まるっとWeb — main.js（依存ライブラリなし） */
(function () {
  'use strict';

  var contact = document.getElementById('contact');
  var form = document.getElementById('contact-form');

  /* ---------- 年表示 ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- お問い合わせフォーム（モーダル）の開閉 ---------- */
  function openContact(e) {
    if (!contact) return;
    if (e) e.preventDefault();
    // 送信完了後に再度開いた場合は入力画面に戻す
    if (form && !steps.done.hidden) show('input');
    contact.showModal();
    document.body.classList.add('is-modal-open');
    contact.scrollTop = 0;
  }
  function closeContact() {
    if (contact && contact.open) contact.close();
  }
  document.querySelectorAll('[data-open-contact]').forEach(function (el) {
    el.addEventListener('click', openContact);
  });
  document.querySelectorAll('[data-close-contact]').forEach(function (el) {
    el.addEventListener('click', closeContact);
  });
  if (contact) {
    contact.addEventListener('close', function () {
      document.body.classList.remove('is-modal-open');
    });
    // 背景（モーダルの外側）クリックで閉じる
    contact.addEventListener('click', function (e) {
      if (e.target === contact) closeContact();
    });
  }

  if (!form) return;

  /* ---------- 都道府県 ---------- */
  var PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];
  var prefSelect = form.elements.pref;
  PREFS.forEach(function (p) {
    var opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    prefSelect.appendChild(opt);
  });

  /* ---------- 郵便番号から住所検索（zipcloud API） ---------- */
  var zipBtn = document.getElementById('zip-search');
  zipBtn.addEventListener('click', function () {
    var zip = form.elements.zip.value.replace(/[^0-9０-９]/g, '')
      .replace(/[０-９]/g, function (s) { return String.fromCharCode(s.charCodeAt(0) - 0xFEE0); });
    if (zip.length !== 7) { alert('郵便番号を7桁の数字で入力してください。'); return; }
    fetch('https://zipcloud.ibsnet.co.jp/api/search?zipcode=' + zip)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.results) { alert('住所が見つかりませんでした。'); return; }
        var r = data.results[0];
        prefSelect.value = r.address1;
        form.elements.city.value = r.address2 + r.address3;
        form.elements.street.focus();
      })
      .catch(function () { alert('住所検索に失敗しました。お手数ですが直接ご入力ください。'); });
  });

  /* ---------- 入力 → 確認 → 送信 ---------- */
  var steps = {};
  form.querySelectorAll('.form-step').forEach(function (s) { steps[s.dataset.step] = s; });

  function show(name) {
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
    contact.scrollTop = 0;
  }
  function showError(step, msg) {
    var el = steps[step].querySelector('.form-error');
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  var FIELDS = [
    ['法人名', function (f) { return f.company.value; }],
    ['お名前', function (f) {
      var name = (f.last_name.value + ' ' + f.first_name.value).trim();
      var kana = (f.last_name_kana.value + ' ' + f.first_name_kana.value).trim();
      return kana ? name + '（' + kana + '）' : name;
    }],
    ['電話番号', function (f) { return f.tel.value; }],
    ['メールアドレス', function (f) { return f.email.value; }],
    ['住所', function (f) {
      var zip = f.zip.value ? '〒' + f.zip.value + ' ' : '';
      return (zip + f.pref.value + f.city.value + f.street.value + ' ' + f.building.value).trim();
    }],
    ['お問い合わせ内容', function (f) { return f.inquiry_type.value; }],
    ['詳しいご相談内容', function (f) { return f.message.value; }]
  ];

  function validate() {
    var f = form.elements;
    if (!f.last_name.value.trim() || !f.first_name.value.trim()) return 'お名前を入力してください。';
    if (!f.email.value.trim()) return 'メールアドレスを入力してください。';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) return 'メールアドレスの形式が正しくありません。';
    if (!f.inquiry_type.value) return 'お問い合わせ内容を選択してください。';
    return '';
  }

  form.addEventListener('click', function (e) {
    var action = e.target.dataset && e.target.dataset.action;
    if (action === 'confirm') {
      var err = validate();
      showError('input', err);
      if (err) return;
      var dl = steps.confirm.querySelector('.form-confirm');
      dl.innerHTML = '';
      FIELDS.forEach(function (row) {
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = row[0];
        dd.textContent = row[1](form.elements) || '—';
        dl.appendChild(dt); dl.appendChild(dd);
      });
      showError('confirm', '');
      show('confirm');
    } else if (action === 'back') {
      show('input');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var endpoint = form.dataset.endpoint;
    if (!endpoint) {
      showError('confirm', '送信先が未設定です（index.html の data-endpoint を設定してください）。');
      return;
    }
    var btn = form.querySelector('[type="submit"]');
    // スパム対策（人間には見えない入力欄に値が入っていたら送信しない）
    if (form.elements._honey && form.elements._honey.value) { show('done'); return; }

    // メール本文に日本語の項目名で並ぶよう、確認画面と同じ内容を送る
    var payload = {
      _subject: '【まるっとWeb】無料相談・お問い合わせがありました',
      _template: 'table',
      _replyto: form.elements.email.value.trim()
    };
    FIELDS.forEach(function (row) { payload[row[0]] = row[1](form.elements) || '—'; });

    btn.disabled = true;
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (data.message || ''));
          return data;
        });
      })
      .then(function (data) {
        if (String(data.success) !== 'true') throw new Error(data.message || 'failed');
        form.reset();
        show('done');
      })
      .catch(function (err) {
        console.error('[contact-form]', err.message);
        // FormSubmit の初回送信時は「有効化が必要」という応答が返る
        if (/activat/i.test(err.message)) {
          showError('confirm', '送信先の有効化が必要です。受信用のメールに届いた FormSubmit の「Activate Form」リンクをクリックしてから、再度送信してください。');
        } else {
          showError('confirm', '送信に失敗しました。時間をおいて再度お試しください。');
        }
      })
      .finally(function () { btn.disabled = false; });
  });
})();
