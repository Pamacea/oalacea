export type AnalyticsEvent = {
  name: string
  properties?: Record<string, unknown>
}

export function trackEvent({ name, properties }: AnalyticsEvent): void {
  if (typeof window === "undefined") return

  console.log("[Analytics]", name, properties)
}

export function trackPageView(path: string): void {
  trackEvent({ name: "page_view", properties: { path } })
}
