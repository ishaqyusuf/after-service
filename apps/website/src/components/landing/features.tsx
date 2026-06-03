import { Card, CardContent, CardHeader, CardTitle } from "@afterservice/ui";
import { 
  Bot, 
  MessageSquare, 
  ShieldAlert, 
  RefreshCw, 
  Trophy, 
  Lock 
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      title: "Automated Check-Ins",
      description: "Instantly send personalized follow-up texts or emails once a job is finished. No manual input, no writing messages.",
      icon: <Bot className="w-6 h-6" />
    },
    {
      title: "Google Review Funnel",
      description: "Happy customers are automatically routed to your Google and Yelp pages to leave glowing reviews, dramatically boosting your SEO.",
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      title: "Private Conflict Resolution",
      description: "If a client had an issue, they are directed to a private form to speak directly with you. Resolve disputes privately before they hurt your public rating.",
      icon: <ShieldAlert className="w-6 h-6" />
    },
    {
      title: "Repeat Visit Reminders",
      description: "Schedule smart seasonal maintenance alerts, follow-up inspection prompts, or warranty checks based on the job completed.",
      icon: <RefreshCw className="w-6 h-6" />
    },
    {
      title: "Staff Leaderboards",
      description: "See which technician or operator drives the most 5-star reviews and has the highest customer satisfaction scores.",
      icon: <Trophy className="w-6 h-6" />
    },
    {
      title: "Enterprise Grade Security",
      description: "Role-based workspace scopes protect customer data. Secure authentication keeps your client list locked down.",
      icon: <Lock className="w-6 h-6" />
    }
  ];

  return (
    <section id="features" className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
          Built for Local Service Experts
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Everything you need to automate check-ins, build trust, and ensure
          customers call you first next time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <Card key={i} className="hover:border-[#009b98]/40 shadow-sm dark:shadow-none transition-all duration-300 group bg-card">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
