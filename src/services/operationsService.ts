import axiosClient from "../api/axiosClient";

export type RecordStatus = "Active" | "Inactive";

export interface WashService {
  ServiceID: number;
  ServiceName: string;
  Description: string | null;
  BasePrice: number | string;
  DurationMinutes: number | null;
  Type: string | null;
  Status: RecordStatus;
}

export type ServicePayload = Omit<WashService, "ServiceID" | "BasePrice" | "DurationMinutes"> & {
  BasePrice: number;
  DurationMinutes?: number;
};

export interface Promotion {
  PromotionID: number;
  BranchID: number | null;
  PromotionName: string;
  DiscountType: "PERCENTAGE" | "FIXED_AMOUNT";
  DiscountValue: number | string;
  StartDate: string;
  EndDate: string;
  UsageLimit: number | null;
  Status: RecordStatus;
}

export interface PromotionPayload {
  BranchID: number | null;
  PromotionName: string;
  DiscountType: "PERCENTAGE" | "FIXED_AMOUNT";
  DiscountValue: number;
  StartDate: string;
  EndDate: string;
  UsageLimit: number | null;
  Status?: RecordStatus;
}

export interface BranchServiceAssignment {
  BranchServiceID: number;
  BranchID: number;
  ServiceID: number;
  PriceOverride: number | string | null;
  Status: RecordStatus;
  Services: WashService;
  branches?: { BranchID: number; BranchName: string };
}

export interface BranchConfig {
  ConfigID?: number;
  BranchID: number;
  SlotDuration?: number;
  TotalWashBays?: number;
  BufferMinutes?: number;
  MaxCarsPerBooking?: number;
  CancelWindowHours?: number;
}

export interface Shift {
  ShiftID: number;
  ShiftName: string;
  StartTime: string | null;
  EndTime: string | null;
  Status: RecordStatus;
}

export interface StaffSchedule {
  ScheduleID: number;
  UserID: number;
  WorkDate: string;
  ShiftID: number;
  CapacityWeight: number | string | null;
  Status: RecordStatus;
  Users?: { FullName: string; Phone: string | null; BranchID: number | null };
  Shifts?: { ShiftName: string; StartTime: string | null; EndTime: string | null };
}

const headers = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const dataOf = <T>(response: { data?: { success?: boolean; data?: T; message?: string } }): T => {
  if (!response.data?.success) throw new Error(response.data?.message || "Thao tác thất bại");
  return response.data.data as T;
};

const timeToIso = (time: string) => `1970-01-01T${time}:00.000Z`;

const operationsService = {
  async getServices(params: { Status?: RecordStatus; Type?: string } = {}) {
    return dataOf<WashService[]>(await axiosClient.get("/api/services", { params }));
  },
  async createService(payload: ServicePayload) {
    return dataOf<WashService>(await axiosClient.post("/api/services", payload, { headers: headers() }));
  },
  async updateService(id: number, payload: Partial<ServicePayload>) {
    return dataOf<WashService>(await axiosClient.put(`/api/services/${id}`, payload, { headers: headers() }));
  },
  async deleteService(id: number) {
    await axiosClient.delete(`/api/services/${id}`, { headers: headers() });
  },

  async getPromotions() {
    return dataOf<Promotion[]>(await axiosClient.get("/api/promotions", { headers: headers() }));
  },
  async createPromotion(payload: PromotionPayload) {
    return dataOf<Promotion>(await axiosClient.post("/api/promotions", payload, { headers: headers() }));
  },
  async updatePromotion(id: number, payload: Partial<PromotionPayload>) {
    return dataOf<Promotion>(await axiosClient.put(`/api/promotions/${id}`, payload, { headers: headers() }));
  },
  async deletePromotion(id: number) {
    await axiosClient.delete(`/api/promotions/${id}`, { headers: headers() });
  },

  async getBranchServices(branchId: number) {
    return dataOf<BranchServiceAssignment[]>(await axiosClient.get("/api/branch-services", {
      params: { BranchID: branchId }, headers: headers(),
    }));
  },
  async assignBranchService(payload: { BranchID: number; ServiceID: number; PriceOverride: number | null; Status?: RecordStatus }) {
    return dataOf<BranchServiceAssignment>(await axiosClient.post("/api/branch-services", payload, { headers: headers() }));
  },
  async updateBranchService(id: number, payload: { PriceOverride: number | null; Status: RecordStatus }) {
    return dataOf<BranchServiceAssignment>(await axiosClient.put(`/api/branch-services/${id}`, payload, { headers: headers() }));
  },
  async deleteBranchService(id: number) {
    await axiosClient.delete(`/api/branch-services/${id}`, { headers: headers() });
  },

  async getBranchConfig(branchId: number) {
    return dataOf<BranchConfig>(await axiosClient.get("/api/branch-configs", {
      params: { BranchID: branchId }, headers: headers(),
    }));
  },
  async saveBranchConfig(payload: BranchConfig) {
    return dataOf<BranchConfig>(await axiosClient.post("/api/branch-configs", payload, { headers: headers() }));
  },

  async getShifts(status?: RecordStatus) {
    return dataOf<Shift[]>(await axiosClient.get("/api/shifts", { params: status ? { Status: status } : {}, headers: headers() }));
  },
  async createShift(payload: { ShiftName: string; StartTime: string; EndTime: string }) {
    return dataOf<Shift>(await axiosClient.post("/api/shifts", {
      ...payload, StartTime: timeToIso(payload.StartTime), EndTime: timeToIso(payload.EndTime),
    }, { headers: headers() }));
  },
  async updateShift(id: number, payload: { ShiftName: string; StartTime: string; EndTime: string; Status: RecordStatus }) {
    return dataOf<Shift>(await axiosClient.put(`/api/shifts/${id}`, {
      ...payload, StartTime: timeToIso(payload.StartTime), EndTime: timeToIso(payload.EndTime),
    }, { headers: headers() }));
  },
  async deleteShift(id: number) {
    await axiosClient.delete(`/api/shifts/${id}`, { headers: headers() });
  },

  async getSchedules(params: { UserID?: number; ShiftID?: number; from?: string; to?: string; Status?: RecordStatus } = {}) {
    return dataOf<StaffSchedule[]>(await axiosClient.get("/api/staff-schedules", { params, headers: headers() }));
  },
  async createSchedule(payload: { UserID: number; WorkDate: string; ShiftID: number; CapacityWeight: number }) {
    return dataOf<StaffSchedule>(await axiosClient.post("/api/staff-schedules", payload, { headers: headers() }));
  },
  async updateSchedule(id: number, payload: { WorkDate: string; ShiftID: number; CapacityWeight: number; Status: RecordStatus }) {
    return dataOf<StaffSchedule>(await axiosClient.put(`/api/staff-schedules/${id}`, payload, { headers: headers() }));
  },
  async deleteSchedule(id: number) {
    await axiosClient.delete(`/api/staff-schedules/${id}`, { headers: headers() });
  },
};

export default operationsService;
