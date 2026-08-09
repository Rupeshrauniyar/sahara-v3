import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const variants = {
  default: {
    container:
      "border-[#DFE8F1] bg-white hover:border-[#B9CDE3] hover:bg-[#F9FBFE]",
    icon:
      "bg-[#EEF3F8] text-[#627890]",
    title:
      "!text-[#263E59]",
    description:
      "!text-[#8393A4]",
    arrow:
      "text-[#8292A4] group-hover:text-[#1717E8]",
  },

  primary: {
    container:
      "border-[#C7D4FF] bg-[#F2F4FF] hover:border-[#1717E8] hover:bg-[#ECEFFF]",
    icon:
      "bg-[#1717E8] text-white",
    title:
      "!text-[#1717E8]",
    description:
      "!text-[#5F7090]",
    arrow:
      "text-[#1717E8]",
  },

  danger: {
    container:
      "border-red-200 bg-red-50/70 hover:border-red-300 hover:bg-red-50",
    icon:
      "bg-red-100 text-red-600",
    title:
      "!text-red-700",
    description:
      "!text-red-500",
    arrow:
      "text-red-500",
  },
};

const QuickAction = ({
  icon,
  title,
  description,
  to,
  onClick,
  variant = "default",
}) => {
  const style =
    variants[variant] ||
    variants.default;

  const IconComponent =
    typeof icon === "string"
      ? null
      : icon;

  const content = (
    <>
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[13px] ${style.icon}`}
      >
        {IconComponent ? (
          <IconComponent
            size={19}
            strokeWidth={2}
          />
        ) : (
          <span className="text-[17px]">
            {icon}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">

        <p
          className={`text-[11.5px] font-extrabold ${style.title}`}
        >
          {title}
        </p>

        <p
          className={`mt-1 text-[9.5px] leading-5 ${style.description}`}
        >
          {description}
        </p>
      </div>

      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white shadow-sm transition ${style.arrow}`}
      >
        <ArrowUpRight
          size={14}
        />
      </div>
    </>
  );

  const className = `group flex w-full items-center gap-3 rounded-[17px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(20,46,79,0.07)] ${style.container}`;

  if (to) {
    return (
      <Link
        to={to}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
};

export default QuickAction;