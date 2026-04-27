interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return <div className="min-h-screen bg-warm">{children}</div>;
}
