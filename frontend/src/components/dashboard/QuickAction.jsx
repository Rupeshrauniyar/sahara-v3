import { Link } from "react-router-dom";

const QuickAction = ({ icon, title, description, to, onClick, variant = "default" }) => {
  const variants = {
    default: "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50",
    danger: "border-rose-200 bg-rose-50/50 hover:border-rose-300 hover:bg-rose-50",
    primary: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50",
  };

  const className = `flex items-start gap-4 p-4 rounded-2xl border transition-all text-left w-full ${variants[variant]}`;

  const content = (
    <>
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

export default QuickAction;
