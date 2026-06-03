export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 bg-muted border-y border-border py-24 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
            Three Steps to Automated Success
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            How afterservice saves time and generates recurring work in the
            background.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary mb-6">
              1
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              Job Completion
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Log a job in your dashboard or let your existing CRM signal
              completion automatically.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary mb-6">
              2
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              Automated Dispatch
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Our follow-up engine sends an email or text template customized
              to the job type.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary mb-6">
              3
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              Growth & Reactivation
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Collect Google reviews directly, while our scheduler plans your
              next maintenance alert.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
