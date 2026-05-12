interface Props {
  title: string;
  description: string;
}

export default function ServiceCard({ title, description }: Props) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-900/5 transition duration-200 hover:border-teal-200/80 hover:shadow-md hover:shadow-teal-900/5 hover:-translate-y-0.5">
      <div className="h-1 w-10 rounded-full bg-teal-500 group-hover:w-14 transition-all duration-200" />
      <h3 className="mt-4 text-xl font-semibold text-teal-800">{title}</h3>
      <p className="mt-2 text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}