interface Props {
  title: string
  description: string
}

export default function ServiceCard({ title, description }: Props) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6">

      <h3 className="text-xl font-semibold text-teal-600">
        {title}
      </h3>

      <p className="mt-2 text-gray-600">
        {description}
      </p>

    </div>
  )
}