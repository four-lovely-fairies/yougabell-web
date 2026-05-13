export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <div
        className="flex-1 flex flex-col w-full max-w-md mx-auto px-5"
        style={{
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
