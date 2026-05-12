import Hero from "@/components/Hero"
import ServiceCard from "@/components/ServiceCard"

export default function Home() {

  return (
    <main>

      <Hero />

      <section className="max-w-6xl mx-auto py-20 px-6">

        <h2 className="text-3xl font-bold text-center mb-10">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <ServiceCard
            title="Physiotherapy"
            description="Restore movement and function"
          />

          <ServiceCard
            title="Sports Massage"
            description="Relieve muscle tension"
          />

          <ServiceCard
            title="Performance Training"
            description="Improve athletic performance"
          />

        </div>

      </section>

    </main>
  )
}