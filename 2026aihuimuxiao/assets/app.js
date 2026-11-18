/* 2026 爱回母校 · 地区 QQ 群
 * 纯前端：省份 → 江苏省地级市 → 对应二维码图片
 * 图片位于 images/，支持 jpg / jpeg / png / webp 自动探测。
 */

const REGIONS = [
  { name: "北京市", type: "直辖市", img: "北京" },
  { name: "天津市", type: "直辖市", img: "天津" },
  { name: "河北省", type: "省", img: "河北" },
  { name: "山西省", type: "省", img: "山西" },
  { name: "内蒙古自治区", type: "自治区", img: "内蒙古" },
  { name: "辽宁省", type: "省", img: "辽宁" },
  { name: "吉林省", type: "省", img: "吉林" },
  { name: "黑龙江省", type: "省", img: "黑龙江" },
  { name: "上海市", type: "直辖市", img: "上海" },
  {
    name: "江苏省",
    type: "省",
    img: "江苏",
    cities: ["南京", "无锡", "徐州", "常州", "苏州", "南通", "连云港", "淮安", "盐城", "扬州", "镇江", "泰州", "宿迁"],
  },
  { name: "浙江省", type: "省", img: "浙江" },
  { name: "安徽省", type: "省", img: "安徽" },
  { name: "福建省", type: "省", img: "福建" },
  { name: "江西省", type: "省", img: "江西" },
  { name: "山东省", type: "省", img: "山东" },
  { name: "河南省", type: "省", img: "河南" },
  { name: "湖北省", type: "省", img: "湖北" },
  { name: "湖南省", type: "省", img: "湖南" },
  { name: "广东省", type: "省", img: "广东" },
  { name: "广西壮族自治区", type: "自治区", img: "广西" },
  { name: "海南省", type: "省", img: "海南" },
  { name: "重庆市", type: "直辖市", img: "重庆" },
  { name: "四川省", type: "省", img: "四川" },
  { name: "贵州省", type: "省", img: "贵州" },
  { name: "云南省", type: "省", img: "云南" },
  { name: "西藏自治区", type: "自治区", img: "西藏" },
  { name: "陕西省", type: "省", img: "陕西" },
  { name: "甘肃省", type: "省", img: "甘肃" },
  { name: "青海省", type: "省", img: "青海" },
  { name: "宁夏回族自治区", type: "自治区", img: "宁夏" },
  { name: "新疆维吾尔自治区", type: "自治区", img: "新疆" },
];

const EXTS = ["jpeg", "jpg", "png", "webp"];
const IMG_DIR = "images/";

const el = {
  open: document.getElementById("openPicker"),
  change: document.getElementById("changeBtn"),
  scrim: document.getElementById("scrim"),
  modal: document.getElementById("modal"),
  close: document.getElementById("closeBtn"),
  cancel: document.getElementById("cancelBtn"),
  confirm: document.getElementById("confirmBtn"),
  province: document.getElementById("province"),
  city: document.getElementById("city"),
  cityField: document.getElementById("cityField"),
  note: document.getElementById("modalNote"),
  result: document.getElementById("result"),
  kicker: document.getElementById("resultKicker"),
  title: document.getElementById("resultTitle"),
  stage: document.getElementById("stage"),
  skeleton: document.getElementById("skeleton"),
  frame: document.getElementById("qrFrame"),
  image: document.getElementById("qrImage"),
  empty: document.getElementById("empty"),
  retry: document.getElementById("emptyRetry"),
  hint: document.getElementById("hint"),
};

let current = null;      // { label, kicker, img }
let renderToken = 0;
let lastFocus = null;

/* ---------- data ---------- */

for (const region of REGIONS) {
  const option = document.createElement("option");
  option.value = region.name;
  option.textContent = region.name;
  el.province.appendChild(option);
}

el.province.addEventListener("change", syncCityField);
el.city.addEventListener("change", syncConfirmState);

function selectedRegion() {
  return REGIONS.find((r) => r.name === el.province.value) || null;
}

function syncCityField() {
  const region = selectedRegion();
  const hasCities = Boolean(region && region.cities && region.cities.length);

  el.cityField.hidden = !hasCities;
  el.city.innerHTML = '<option value="">请选择城市</option>';
  el.confirm.disabled = true;

  if (hasCities) {
    for (const city of region.cities) {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      el.city.appendChild(option);
    }
    el.note.textContent = "江苏省下辖 13 个地级市，选择城市可获得更精确的群二维码。";
  } else if (region) {
    el.note.textContent = "该省份暂无细分城市，将展示省级群二维码。";
  } else {
    el.note.textContent = "江苏省下辖 13 个地级市，选择城市可获得更精确的群二维码。";
  }

  syncConfirmState();
}

function syncConfirmState() {
  const region = selectedRegion();
  el.confirm.disabled = !region || Boolean(region.cities && !el.city.value);
}

/* ---------- modal ---------- */

function openModal() {
  lastFocus = document.activeElement;
  el.scrim.hidden = false;
  document.body.style.overflow = "hidden";

  if (current) {
    const region = REGIONS.find((r) => r.name === current.province) || null;
    if (region) {
      el.province.value = region.name;
      syncCityField();
      if (region.cities && current.city) el.city.value = current.city;
    }
  }
  syncConfirmState();
  requestAnimationFrame(() => el.province.focus({ preventScroll: true }));
}

function closeModal() {
  el.scrim.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

el.open.addEventListener("click", openModal);
el.change.addEventListener("click", openModal);
el.retry.addEventListener("click", openModal);
el.close.addEventListener("click", closeModal);
el.cancel.addEventListener("click", closeModal);
el.scrim.addEventListener("click", (event) => {
  if (event.target === el.scrim) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !el.scrim.hidden) closeModal();
});

el.confirm.addEventListener("click", () => {
  const region = selectedRegion();
  if (!region) return;

  const city = region.cities ? el.city.value : "";
  if (region.cities && !city) return;

  const payload = {
    label: city ? `${region.name.replace(/[省市]$/, "")} · ${city}` : region.name,
    kicker: city ? "江苏省 · 地级市" : region.type,
    img: city || region.img,
    province: region.name,
    city,
    type: region.type,
  };

  closeModal();
  showRegion(payload);
  rememberInUrl(city || region.img);
});

/* ---------- result ---------- */

function showRegion(payload) {
  current = payload;
  const token = ++renderToken;

  el.kicker.textContent = payload.kicker;
  el.title.textContent = payload.label;
  el.image.alt = `${payload.label} QQ 群二维码`;
  el.result.hidden = false;

  el.skeleton.hidden = false;
  el.frame.hidden = true;
  el.empty.hidden = true;
  el.stage.dataset.state = "loading";
  el.hint.textContent = "用 QQ 扫描二维码即可加入群聊 · 手机上可长按图片识别";

  el.result.scrollIntoView({ behavior: "smooth", block: "nearest" });

  findImage(payload.img).then((src) => {
    if (token !== renderToken) return;

    if (!src) {
      showEmpty();
      return;
    }

    el.image.onload = () => {
      if (token !== renderToken) return;
      el.skeleton.hidden = true;
      el.frame.hidden = false;
      el.stage.dataset.state = "ready";
    };
    el.image.onerror = () => {
      if (token !== renderToken) return;
      showEmpty();
    };
    el.image.src = src;

    if (el.image.complete && el.image.naturalWidth > 0) {
      el.skeleton.hidden = true;
      el.frame.hidden = false;
      el.stage.dataset.state = "ready";
    }
  });
}

function showEmpty() {
  el.skeleton.hidden = true;
  el.frame.hidden = true;
  el.empty.hidden = false;
  el.stage.dataset.state = "empty";
  el.hint.textContent = "可以返回上一步选择其他地区，或联系活动负责人补充二维码。";
}

function findImage(base) {
  return new Promise((resolve) => {
    let index = 0;

    const attempt = () => {
      if (index >= EXTS.length) {
        resolve(null);
        return;
      }
      const src = `${IMG_DIR}${encodeURIComponent(base)}.${EXTS[index++]}`;
      const probe = new Image();
      probe.onload = () => resolve(src);
      probe.onerror = attempt;
      probe.src = src;
    };

    attempt();
  });
}

/* ---------- shareable deep link (?r=南京) ---------- */

function rememberInUrl(key) {
  try {
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("r", key);
    history.replaceState(null, "", url);
  } catch (_) {
    /* file:// 等环境忽略 */
  }
}

function restoreFromUrl() {
  let key = "";
  try {
    key = new URL(location.href).searchParams.get("r") || "";
  } catch (_) {
    return;
  }
  if (!key) return;

  for (const region of REGIONS) {
    if (region.cities && region.cities.includes(key)) {
      showRegion({
        label: `${region.name.replace(/[省市]$/, "")} · ${key}`,
        kicker: "江苏省 · 地级市",
        img: key,
        province: region.name,
        city: key,
        type: region.type,
      });
      return;
    }
    if (region.img === key) {
      showRegion({
        label: region.name,
        kicker: region.type,
        img: region.img,
        province: region.name,
        city: "",
        type: region.type,
      });
      return;
    }
  }
}

restoreFromUrl();
