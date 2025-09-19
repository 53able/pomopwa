// Base64からUint8Arrayへの変換用ユーティリティ関数
declare global {
  function urlBase64ToUint8Array(base64String: string): Uint8Array;
}

export {};
