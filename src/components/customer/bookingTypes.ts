export type Branch = {
  BranchID: number;
  BranchName: string;
  Address: string | null;
  Phone: string | null;
  OpenTime: string | null;
  CloseTime: string | null;
  BankAccount?: string | null;
  Status: string | null;
  Latitude?: number | null;
  Longitude?: number | null;
};

export type Vehicle = {
  VehicleID: number;
  LicensePlate: string;
  VehicleType?: string | null;
  Brand?: string | null;
  Model?: string | null;
  Color?: string | null;
  Status?: string | null;
  CreatedAt?: string | null;
};

export type Service = {
  BranchServiceID: number;
  ServiceID: number;
  ServiceName: string;
  Description: string | null;
  DurationMinutes: number | null;
  Type: string | null;
  BasePrice: number | string;
  PriceOverride: number | string | null;
  ActualPrice: number | string;
};

export type Slot = {
  StartTime: string;
  EndTime: string;
  ShiftName: string;
  StaffCount: number;
  MaxCapacity: number;
  Booked: number;
  Available: number;
  Status: string;
};
