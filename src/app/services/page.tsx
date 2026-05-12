import ServiceCard from "@/components/ServiceCard"

export default function Services() {

  return (
    <main className="max-w-6xl mx-auto py-20 px-6">

      <h1 className="text-4xl font-bold mb-10">
        Our Services
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        <ServiceCard
          title="Physiotherapy"
          description="Injury rehab and recovery"
        />

        <ServiceCard
          title="Sports Massage"
          description="Muscle recovery and relaxation"
        />

        <ServiceCard
          title="Performance Training"
          description="Mobility and strength training"
        />

      </div>

    </main>
  )
}