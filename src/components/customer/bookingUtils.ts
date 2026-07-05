export function formatMoney(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export function formatTime(value: string | null | undefined) {
  if (!value) {
    return "--:--";
  }

  const text = String(value);

  if (text.includes("T")) {
    return text.substring(11, 16);
  }

  return text.substring(0, 5);
}
