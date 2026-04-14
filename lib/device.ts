export function isLikelyMobileDevice(userAgent: string) {
  return /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(userAgent);
}
