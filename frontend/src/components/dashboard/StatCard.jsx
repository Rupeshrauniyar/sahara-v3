import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

const ACCENTS = {
  blue: {
    icon:
      "bg-[#EEF2FF] text-[#1717E8]",
    glow:
      "from-[#1717E8]/8",
  },

  emerald: {
    icon:
      "bg-emerald-50 text-emerald-600",
    glow:
      "from-emerald-500/8",
  },

  amber: {
    icon:
      "bg-amber-50 text-amber-600",
    glow:
      "from-amber-500/8",
  },

  rose: {
    icon:
      "bg-rose-50 text-rose-600",
    glow:
      "from-rose-500/8",
  },

  violet: {
    icon:
      "bg-violet-50 text-violet-600",
    glow:
      "from-violet-500/8",
  },

  cyan: {
    icon:
      "bg-cyan-50 text-cyan-600",
    glow:
      "from-cyan-500/8",
  },
};

const StatCard = ({
  icon,
  label,
  value,
  trend,
  trendUp = true,
  accent = "blue",
  helper,
}) => {
  const styles =
    ACCENTS[accent] ||
    ACCENTS.blue;

  const IconComponent =
    typeof icon === "string"
      ? null
      : icon;

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#E0E8F1] bg-white p-5 shadow-[0_10px_30px_rgba(22,47,82,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-[#C9D6E5] hover:shadow-[0_18px_40px_rgba(22,47,82,0.08)]">

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${styles.glow} to-transparent opacity-70`}
      />

      <div className="relative">

        <div className="flex items-start justify-between gap-3">

          <div
            className={`grid h-11 w-11 place-items-center rounded-[13px] ${styles.icon}`}
          >
            {IconComponent ? (
              <IconComponent
                size={20}
                strokeWidth={2}
              />
            ) : (
              <span className="text-[18px]">
                {icon}
              </span>
            )}
          </div>

          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[8.5px] font-extrabold ${
                trendUp
                  ? "bg-emerald-50 !text-emerald-700"
                  : "bg-rose-50 !text-rose-700"
              }`}
            >
              {trendUp ? (
                <ArrowUpRight
                  size={11}
                />
              ) : (
                <ArrowDownRight
                  size={11}
                />
              )}

              <span
                className={
                  trendUp
                    ? "!text-emerald-700"
                    : "!text-rose-700"
                }
              >
                {trend}
              </span>
            </span>
          )}
        </div>

        <p className="mt-5 font-[Manrope] text-[27px] font-extrabold tracking-[-0.04em] !text-[#10233F]">
          {value}
        </p>

        <p className="mt-1 text-[10.5px] font-bold !text-[#73869B]">
          {label}
        </p>

        {helper && (
          <p className="mt-2 text-[9px] !text-[#9AA7B5]">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;