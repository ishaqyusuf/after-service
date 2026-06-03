export function LandingMetrics() {
  return (
    <section className="relative z-10 border-y border-border bg-muted py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
            $48M+
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            Service Revenue Tracked
          </p>
        </div>
        <div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
            +31%
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            Repeat Booking Rate
          </p>
        </div>
        <div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2">
            14,200+
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            5-Star Reviews Driven
          </p>
        </div>
        <div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
            99.2%
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            Conflict Resolution Rate
          </p>
        </div>
      </div>
    </section>
  );
}
