import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <section>
        <h1 className="text-4xl font-bold mb-2">💡 About LaunchMate</h1>
        <p className="text-xl text-gray-600">Empowering Founders. Simplifying Startups. Fueling Innovation.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🚀 Our Mission</h2>
        <p>
          At <strong>LaunchMate</strong>, we believe that <em>every idea deserves a chance to succeed</em>—regardless of background, experience, or resources. Too many aspiring founders abandon their dreams because they feel overwhelmed by the complexities of launching a startup. Our mission is to <strong>democratize entrepreneurship</strong> by providing the tools, templates, and guidance needed to turn any vision into reality. We aim to be more than just a platform—we are a <em>partner in your journey</em>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🌟 What is LaunchMate?</h2>
        <p><strong>LaunchMate</strong> is an all-in-one, AI-powered assistant built to guide users from ideation to fundraising and scaling.</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Clarify and validate your ideas</li>
          <li>Build your MVP with structured milestones</li>
          <li>Track market trends and competitors in real-time</li>
          <li>Connect with other entrepreneurs, tools, and investors</li>
          <li>Get proactive, memory-driven guidance tailored to your journey</li>
          <li>Create pitch decks, roadmaps, and growth plans—faster than ever</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🧠 How It Works</h2>
        <h3 className="text-xl font-medium mt-4">🔧 Workspace</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Create new startup ideas with a plus symbol</li>
          <li>Specify problem, solution, and industry</li>
          <li>Organize your dashboard into public/private projects</li>
          <li>Search and edit templates or clone existing ideas</li>
        </ul>

        <h3 className="text-xl font-medium mt-6">🧩 Sidebar Navigation</h3>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Dashboard to view all projects</li>
          <li>Settings for themes, notifications, privacy</li>
          <li>Help Tab for templates, examples, and learning resources</li>
          <li>About Tab (this page!)</li>
          <li>Logout securely when you're done</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🛠 What We’ve Built</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>TypeScript for core backend + frontend</li>
          <li>PLpgSQL for smart, optimized database functions</li>
          <li>JavaScript + CSS + HTML for a clean and interactive UI</li>
          <li>AI & memory systems to learn from user actions and provide dynamic support</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🔍 Key Features</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Live Market Tracking</li>
          <li>Elevator Pitch Generator</li>
          <li>Milestone Tracker</li>
          <li>Investor + Founder Network via LinkedIn API</li>
          <li>AI Updates with tailored business insights</li>
          <li>Smart Templates for rapid idea generation</li>
          <li>Memory-Driven Assistant that evolves with you</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🧗 The Startup Journey with LaunchMate</h2>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li><strong>IDEA STAGE</strong> – Brainstorm. Research. Save and revisit anytime.</li>
          <li><strong>VALIDATION STAGE</strong> – Test your concept. Get real feedback.</li>
          <li><strong>MVP STAGE</strong> – Build fast. Iterate faster.</li>
          <li><strong>USER FEEDBACK STAGE</strong> – Onboard early adopters. Improve using data.</li>
          <li><strong>FUNDRAISING STAGE</strong> – Create decks. Track profits. Grow strategically.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">📚 What We Learned</h2>
        <p>
          Building LaunchMate taught us the power of <em>user-first design</em>, the importance of <strong>feedback-driven development</strong>, and the need to stay agile in a constantly evolving startup ecosystem.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">🔮 What’s Next</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Advanced AI modeling for growth insights</li>
          <li>Investor discovery and warm introductions</li>
          <li>Deeper integration with Stripe, Notion, Google Analytics</li>
          <li>Custom visual reports and startup dashboards</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">👥 Meet the Team</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Ansh Mathur</strong> – Computer Science Student, UMD</li>
          <li><strong>Adhyyan Kumar</strong> – Computer Science Student, UMD</li>
          <li><strong>Mikhil Chohda</strong> – Computer Science Student, UMD</li>
          <li><strong>Yashovardhan Saraswat</strong> – Computer Engineering Student, UMD</li>
        </ul>
      </section>

      <footer className="text-center text-gray-500 pt-10 border-t">
        <p>Let us be your co-founder, your planner, your strategist—your <strong>LaunchMate</strong>.</p>
      </footer>
    </div>
  );
}
