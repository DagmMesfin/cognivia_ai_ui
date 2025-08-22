import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      description: "Basic features for individual students",
      price: "$0",
      period: "forever",
      features: [
        "Smart Note-Taking (limited)",
        "Basic AI Q&A",
        "3 Notebooks",
        "5 AI queries per day",
        "Basic analytics",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced features for serious students",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited Smart Note-Taking",
        "Advanced AI Q&A",
        "Unlimited Notebooks",
        "100 AI queries per day",
        "Speech-to-Text & Text-to-Speech",
        "Advanced analytics",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Team",
      description: "For study groups and classes",
      price: "$19.99",
      period: "per month",
      features: [
        "All Pro features",
        "Collaborative notebooks",
        "Team analytics",
        "Shared flashcards",
        "Group quizzes",
        "Admin controls",
        "24/7 support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include core features to enhance your learning.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col ${plan.popular ? "border-blue-500 shadow-lg" : "border-gray-200"}`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 text-green-500"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/sign-up" className="w-full">
                  <Button
                    className={`w-full ${
                      plan.popular ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-16 rounded-lg border bg-white p-8 text-center shadow-sm">
          <h3 className="mb-2 text-2xl font-bold">Need a custom plan for your institution?</h3>
          <p className="mb-6 text-muted-foreground">
            We offer special pricing for universities and educational institutions. Contact our sales team to learn
            more.
          </p>
          <Button size="lg" variant="outline">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  )
}
