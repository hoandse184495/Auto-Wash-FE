import { CalendarDays } from "lucide-react";

type BookingHeaderProps = {
  branchCount: number;
  vehicleCount: number;
};

const BookingHeader = ({ branchCount, vehicleCount }: BookingHeaderProps) => {
  const stats = [
    { label: "Chi nhánh", value: branchCount },
    { label: "Xe đã lưu", value: vehicleCount },
    { label: "Bước", value: "1 lịch hẹn" },
  ];

  return (
    <section className="bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
          <CalendarDays className="h-4 w-4" />
          Auto Wash Pro
        </p>

        <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Đặt lịch rửa xe
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Chọn chi nhánh, xe, dịch vụ và khung giờ phù hợp. Thông tin lịch
              hẹn sẽ được tổng hợp trước khi bạn xác nhận.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/10 bg-white/[0.06] p-4"
              >
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingHeader;
