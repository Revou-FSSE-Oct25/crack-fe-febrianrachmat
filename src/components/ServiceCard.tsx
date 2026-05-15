interface Props {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: Props) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-7 shadow-[0_1px_2px_rgb(15_23_42_/_0.04),0_8px_24px_rgb(15_23_42_/_0.06)] ring-1 ring-slate-900/[0.03] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-teal-200/90 hover:shadow-[0_4px_16px_rgb(15_23_42_/_0.06),0_16px_40px_rgb(13_148_136_/_0.12)]">
      <div className="h-1 w-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-200 group-hover:w-16" />
      <h3 className="mt-5 text-xl font-semibold text-teal-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{description}</p>
    </div>
  );
}
