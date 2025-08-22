import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Computer Science Student",
      content:
        "Cognivia has completely transformed how I study. The AI-powered Q&A system helps me understand complex topics quickly, and the smart note-taking feature saves me hours of work.",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/47-Qt1aeL36zgSBC0Hwf6DYeLgajzK49s.png",
    },
    {
      name: "Sarah Williams",
      role: "Medical Student",
      content:
        "As a medical student with tons of material to learn, Cognivia's summarization tool has been a lifesaver. I can upload my lecture notes and get concise summaries that help me review efficiently.",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/75-spnfhHeLzRuBUetV6Z3DRG7yHbJTuH.png",
    },
    {
      name: "Michael Chen",
      role: "Engineering Student",
      content:
        "The exam practice feature is incredible. It generates questions that are actually relevant to my coursework, and the adaptive feedback helps me focus on areas where I'm struggling.",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-eoDKRFws6kN4V7dBAVTjjQtUrcevP7.png",
    },
    {
      name: "Emily Rodriguez",
      role: "Psychology Major",
      content:
        "I love how Cognivia tracks my progress and identifies my weak areas. The contextual learning assistant recommends exactly what I need to study next, which has improved my grades significantly.",
      avatar: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/girl-KtwNtpGwVfK7fXzWsVcHuSnqpbqffc.png",
    },
  ]

  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">What Students Are Saying</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students who are already using Cognivia to enhance their learning experience.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">"{testimonial.content}"</p>
                  <div className="flex text-yellow-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
