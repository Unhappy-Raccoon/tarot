export type UserPlan = "free" | "premium";

export interface ApiHealthResponse {
  status: "ok";
  service: string;
}
