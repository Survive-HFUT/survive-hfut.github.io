<script setup lang="ts">
import { ref, computed } from 'vue';

const CRYPT_KEY = 'wrdvpnisthebest!';
const CRYPT_IV = 'wrdvpnisthebest!';
const WEBVPN_HOST = 'webvpn.hfut.edu.cn';

const quickLinks = [
  { name: '校园门户', url: 'https://one.hfut.edu.cn' },
  { name: '软件正版化', url: 'http://ms.hfut.edu.cn/' },
  { name: '知网', url: 'https://www.cnki.net' }
];

// --- AES-128-CFB 纯 JS 实现 ---

const SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

const RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function subWord(w: number): number {
  return (SBOX[(w >>> 24) & 0xff] << 24) |
         (SBOX[(w >>> 16) & 0xff] << 16) |
         (SBOX[(w >>> 8) & 0xff] << 8) |
         SBOX[w & 0xff];
}

function rotWord(w: number): number {
  return ((w << 8) | (w >>> 24)) & 0xffffffff;
}

function keyExpansion(keyBytes: number[]): number[] {
  const Nk = 4;
  const Nr = 10;
  const Nb = 4;
  const w: number[] = [];

  for (let i = 0; i < Nk; i++) {
    w[i] = (keyBytes[i * 4] << 24) | (keyBytes[i * 4 + 1] << 16) | (keyBytes[i * 4 + 2] << 8) | keyBytes[i * 4 + 3];
  }

  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = w[i - 1];
    if (i % Nk === 0) {
      temp = subWord(rotWord(temp)) ^ (RCON[i / Nk - 1] << 24);
    }
    w[i] = w[i - Nk] ^ temp;
  }

  return w;
}

function subBytes(state: number[][]): void {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      state[r][c] = SBOX[state[r][c]];
    }
  }
}

function shiftRows(state: number[][]): void {
  for (let r = 1; r < 4; r++) {
    const tmp = state[r].slice();
    for (let c = 0; c < 4; c++) {
      state[r][c] = tmp[(c + r) % 4];
    }
  }
}

function xtime(a: number): number {
  return (a & 0x80) ? ((a << 1) ^ 0x1b) & 0xff : (a << 1) & 0xff;
}

function mixSingle(a: number, b: number): number {
  let result = 0;
  let temp = a;
  for (let i = 0; i < 8; i++) {
    if (b & 1) result ^= temp;
    temp = xtime(temp);
    b >>>= 1;
  }
  return result;
}

function mixColumns(state: number[][]): void {
  for (let c = 0; c < 4; c++) {
    const s0 = state[0][c], s1 = state[1][c], s2 = state[2][c], s3 = state[3][c];
    state[0][c] = mixSingle(s0, 2) ^ mixSingle(s1, 3) ^ s2 ^ s3;
    state[1][c] = s0 ^ mixSingle(s1, 2) ^ mixSingle(s2, 3) ^ s3;
    state[2][c] = s0 ^ s1 ^ mixSingle(s2, 2) ^ mixSingle(s3, 3);
    state[3][c] = mixSingle(s0, 3) ^ s1 ^ s2 ^ mixSingle(s3, 2);
  }
}

function addRoundKey(state: number[][], roundKey: number[][]): void {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      state[r][c] ^= roundKey[r][c];
    }
  }
}

function getRoundKey(w: number[], round: number): number[][] {
  const rk: number[][] = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    const word = w[round * 4 + c];
    rk[0][c] = (word >>> 24) & 0xff;
    rk[1][c] = (word >>> 16) & 0xff;
    rk[2][c] = (word >>> 8) & 0xff;
    rk[3][c] = word & 0xff;
  }
  return rk;
}

function aesEncryptBlock(input: number[], w: number[]): number[] {
  const state: number[][] = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      state[r][c] = input[c * 4 + r];
    }
  }

  addRoundKey(state, getRoundKey(w, 0));

  for (let round = 1; round < 10; round++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, getRoundKey(w, round));
  }

  subBytes(state);
  shiftRows(state);
  addRoundKey(state, getRoundKey(w, 10));

  const output: number[] = [];
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      output.push(state[r][c]);
    }
  }
  return output;
}

function aesCfbEncrypt(plaintext: number[], key: number[], iv: number[]): number[] {
  const w = keyExpansion(key);
  const ciphertext: number[] = [];
  let prev = iv.slice();

  for (let i = 0; i < plaintext.length; i += 16) {
    const encrypted = aesEncryptBlock(prev, w);
    const block = plaintext.slice(i, i + 16);
    for (let j = 0; j < block.length; j++) {
      const c = block[j] ^ encrypted[j];
      ciphertext.push(c);
      prev[j] = c;
    }
    if (block.length < 16) {
      prev = prev.slice(0, block.length).concat(prev.slice(block.length));
    }
  }

  return ciphertext;
}

function aesCfbDecrypt(ciphertext: number[], key: number[], iv: number[]): number[] {
  const w = keyExpansion(key);
  const plaintext: number[] = [];
  let prev = iv.slice();

  for (let i = 0; i < ciphertext.length; i += 16) {
    const encrypted = aesEncryptBlock(prev, w);
    const block = ciphertext.slice(i, i + 16);
    for (let j = 0; j < block.length; j++) {
      plaintext.push(block[j] ^ encrypted[j]);
    }
    prev = block;
  }

  return plaintext;
}

function utf8ToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >>> 6), 0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >>> 12), 0x80 | ((code >>> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): number[] {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new Error('Invalid hexadecimal string');
  }

  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes;
}

function bytesToAscii(bytes: number[]): string {
  if (bytes.some(byte => byte < 0x20 || byte > 0x7e)) {
    throw new Error('Invalid hostname');
  }
  return String.fromCharCode(...bytes);
}

// --- 业务逻辑 ---

const inputUrl = ref('');
const inputError = ref('');
const copied = ref(false);
const direction = ref<'to-vpn' | 'from-vpn'>('to-vpn');

function encryptHost(hostname: string): string {
  const keyBytes = utf8ToBytes(CRYPT_KEY);
  const ivBytes = utf8ToBytes(CRYPT_IV);

  let padded = hostname;
  while (padded.length % 16 !== 0) {
    padded += '0';
  }

  const textBytes = utf8ToBytes(padded);
  const encrypted = aesCfbEncrypt(textBytes, keyBytes, ivBytes);

  const ivHex = bytesToHex(ivBytes);
  const cipherHex = bytesToHex(encrypted);
  const truncated = cipherHex.slice(0, hostname.length * 2);

  return ivHex + truncated;
}

function decryptHost(encryptedHostname: string): string {
  if (encryptedHostname.length <= 32) {
    throw new Error('Missing encrypted hostname');
  }

  const ivBytes = hexToBytes(encryptedHostname.slice(0, 32));
  const cipherBytes = hexToBytes(encryptedHostname.slice(32));
  const keyBytes = utf8ToBytes(CRYPT_KEY);
  return bytesToAscii(aesCfbDecrypt(cipherBytes, keyBytes, ivBytes));
}

function toVPNUrl(url: string): string {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('Unsupported URL');
  }
  const protocol = parsed.protocol.replace(':', '');
  const encHost = encryptHost(parsed.hostname);
  const portPart = parsed.port ? `-${parsed.port}` : '';
  const path = parsed.pathname + parsed.search + parsed.hash;
  return `https://${WEBVPN_HOST}/${protocol}${portPart}/${encHost}${path}`;
}

function fromVPNUrl(url: string): string {
  const parsed = new URL(url);
  if (parsed.hostname.toLowerCase() !== WEBVPN_HOST || parsed.port) {
    throw new Error('Not a HFUT WebVPN URL');
  }

  const match = parsed.pathname.match(/^\/([^/]+)\/([0-9a-f]+)(\/.*)?$/i);
  if (!match) {
    throw new Error('Invalid WebVPN path');
  }

  let protocol = match[1];
  let port = '';
  const portMatch = protocol.match(/^(.*)-(\d+)$/);
  if (portMatch) {
    protocol = portMatch[1];
    port = portMatch[2];
  }
  if (!['http', 'https'].includes(protocol.toLowerCase())) {
    throw new Error('Invalid protocol');
  }

  const hostname = decryptHost(match[2]);
  const path = (match[3] || '') + parsed.search + parsed.hash;
  return new URL(`${protocol}://${hostname}${port ? `:${port}` : ''}${path}`).href;
}

const result = computed(() => {
  const url = inputUrl.value.trim();
  if (!url) return '';
  inputError.value = '';

  try {
    return direction.value === 'to-vpn' ? toVPNUrl(url) : fromVPNUrl(url);
  } catch {
    inputError.value = direction.value === 'to-vpn'
      ? '请输入有效的网址'
      : '请输入有效的合工大 WebVPN 网址';
    return '';
  }
});

function setDirection(value: 'to-vpn' | 'from-vpn') {
  direction.value = value;
  inputUrl.value = '';
  inputError.value = '';
  copied.value = false;
}

function copyResult() {
  if (!result.value) return;
  navigator.clipboard.writeText(result.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}

function setQuickLink(url: string) {
  inputUrl.value = url;
}

defineExpose({ result });
</script>

<template>
  <div class="webvpn-converter">
    <div class="direction-switch" aria-label="转换方向">
      <div class="slider" :class="{ 'slide-right': direction === 'from-vpn' }"></div>
      <button
        :class="{ active: direction === 'to-vpn' }"
        type="button"
        @click="setDirection('to-vpn')"
      >
        转为 WebVPN 网址
      </button>
      <button
        :class="{ active: direction === 'from-vpn' }"
        type="button"
        @click="setDirection('from-vpn')"
      >
        还原原网址
      </button>
    </div>

    <div class="form-group">
      <label for="url">{{ direction === 'to-vpn' ? '原网址' : 'WebVPN 网址' }}</label>
      <input
        id="url"
        type="text"
        v-model="inputUrl"
        :placeholder="direction === 'to-vpn' ? '需要通过 WebVPN 访问的网址' : '需要还原的 WebVPN 网址'"
      />
      <span v-if="inputError" class="error">{{ inputError }}</span>
    </div>

    <div v-if="direction === 'to-vpn'" class="quick-links">
      <p class="quick-label">常用内网网址</p>
      <div class="link-chips">
        <button
          v-for="link in quickLinks"
          :key="link.name"
          class="chip"
          @click="setQuickLink(link.url)"
        >
          {{ link.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.webvpn-converter {
  margin: 20px auto;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}

.direction-switch {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 4px;
  margin-bottom: 16px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.direction-switch .slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border-radius: 4px;
  background: var(--vp-c-bg);
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.direction-switch .slider.slide-right {
  transform: translateX(100%);
}

.direction-switch button {
  position: relative;
  z-index: 1;
  padding: 7px 12px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
  transition: color 0.2s ease;
}

.direction-switch button.active {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  user-select: none;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 14px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.error {
  color: var(--vp-c-danger-1);
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.result-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  margin-bottom: 16px;
}

.result-box code {
  flex: 1;
  word-break: break-all;
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.copy-btn {
  flex-shrink: 0;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.copy-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.quick-label {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.link-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 16px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

@media (max-width: 640px) {
  .webvpn-converter {
    margin: 10px;
    padding: 16px;
  }
}
</style>
