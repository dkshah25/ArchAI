"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  GitBranch, 
  Terminal, 
  MessageSquare, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  TrendingUp, 
  HelpCircle,
  Code
} from "lucide-react";

export default function LandingPage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "success" | "loading">("idle");
  const [demoActiveTab, setDemoActiveTab] = useState<"canvas" | "chat" | "pr">("canvas");

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistStatus("loading");
    setTimeout(() => {
      setWaitlistStatus("success");
      setWaitlistEmail("");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-card-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-neon-purple flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <span className="font-sans font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Arch<span className="text-neon-cyan">AI</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#waitlist" className="hover:text-white transition-colors">Waitlist</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/workspace" 
            className="px-5 py-2 rounded-lg text-sm font-semibold text-black bg-white hover:bg-slate-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2"
          >
            Launch Sandbox <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-7xl mx-auto text-center flex flex-col items-center">
        {/* Release Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-neon-cyan/20 text-xs font-semibold text-neon-cyan mb-8 animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Introducing ArchAI Sandbox Version 1.0</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-sans tracking-tight max-w-5xl leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
          Turn Any Codebase Into <br />
          <span className="bg-gradient-to-r from-neon-cyan via-primary to-neon-purple bg-clip-text text-transparent">
            Living Architecture
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mb-10 leading-relaxed font-normal">
          Understand complex software repositories in minutes. ArchAI clones code, runs AST parsing, draws interactive dependency charts, detects design drift, and replies with code-aware AI chat.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link 
            href="/workspace"
            className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-neon-purple hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:shadow-neon-purple/40"
          >
            Start Analyzing Free <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#demo"
            className="px-8 py-4 rounded-xl font-bold text-slate-300 border border-card-border bg-slate-900/50 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Explore Interactive Demo
          </a>
        </div>
      </section>

      {/* Interactive Demo Panel Section */}
      <section id="demo" className="px-6 py-12 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">See ArchAI in Action</h2>
          <p className="text-slate-400">Experience how the platform tracks files, builds diagrams, and answers architect queries in real time.</p>
        </div>

        {/* Tabs for demo states */}
        <div className="flex justify-center gap-4 mb-6">
          <button 
            onClick={() => setDemoActiveTab("canvas")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${demoActiveTab === "canvas" ? "bg-primary/10 border-primary text-primary" : "border-card-border text-slate-400 hover:text-white"}`}
          >
            Repository Diagram Canvas
          </button>
          <button 
            onClick={() => setDemoActiveTab("chat")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${demoActiveTab === "chat" ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan" : "border-card-border text-slate-400 hover:text-white"}`}
          >
            AI Architect Chat
          </button>
          <button 
            onClick={() => setDemoActiveTab("pr")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${demoActiveTab === "pr" ? "bg-neon-purple/10 border-neon-purple text-neon-purple" : "border-card-border text-slate-400 hover:text-white"}`}
          >
            Branch/PR Impact Review
          </button>
        </div>

        {/* Demo UI Mockup */}
        <div className="glass-panel-glow rounded-2xl overflow-hidden shadow-2xl relative border border-card-border">
          {/* Top Window Actions Bar */}
          <div className="bg-[#0b0b0b] border-b border-card-border px-4 py-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-500/30" />
              <span className="ml-4 text-slate-400 font-mono">workspace / ecommerce-monolith-api</span>
            </div>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-neon-cyan">● Local Engine Connected</span>
              <span className="text-slate-600">v1.0.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[450px]">
            {/* Tree Sidebar Mock (left) */}
            <div className="md:col-span-3 bg-[#080808] border-r border-card-border p-4 text-xs font-mono text-slate-400 flex flex-col gap-3">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Files Explorer</span>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-slate-200"><Code className="w-3.5 h-3.5 text-blue-400" /> main.py</div>
                <div className="pl-3 flex flex-col gap-2 border-l border-slate-800 ml-1.5 mt-1">
                  <div className="flex items-center gap-2 text-slate-200"><Code className="w-3.5 h-3.5 text-cyan-400" /> api/routes/users.py</div>
                  <div className="flex items-center gap-2"><Code className="w-3.5 h-3.5 text-slate-500" /> api/controllers/user_controller.py</div>
                  <div className="flex items-center gap-2"><Code className="w-3.5 h-3.5 text-indigo-400" /> api/services/payment_service.py</div>
                  <div className="flex items-center gap-2"><Code className="w-3.5 h-3.5 text-yellow-400" /> database/models.py</div>
                </div>
                <div className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Dockerfile</div>
              </div>
            </div>

            {/* Main Interactive Demo Pane */}
            <div className="md:col-span-9 bg-[#030303] p-6 relative flex flex-col justify-between">
              
              {demoActiveTab === "canvas" && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  {/* Visual Node Diagram Mock */}
                  <div className="w-full max-w-md bg-[#0a0a0a] rounded-xl border border-card-border p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-card-border pb-2">
                      <span>Dependency Flow</span>
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">AST Map</span>
                    </div>
                    {/* Nodes in Graph */}
                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div className="p-2.5 rounded border border-neon-cyan/50 bg-[#0c1e24] flex items-center justify-between text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                        <span>🌐 api/routes/users.py</span>
                        <span className="text-[10px] uppercase">Route</span>
                      </div>
                      <div className="w-0.5 h-4 bg-slate-700 mx-auto" />
                      <div className="p-2.5 rounded border border-neon-purple/50 bg-[#170e24] flex items-center justify-between text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                        <span>⚙️ api/services/payment_service.py</span>
                        <span className="text-[10px] uppercase">Service</span>
                      </div>
                      <div className="w-0.5 h-4 bg-slate-700 mx-auto" />
                      <div className="p-2.5 rounded border border-neon-green/50 bg-[#0d1f14] flex items-center justify-between text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <span>🗄️ database/models.py</span>
                        <span className="text-[10px] uppercase">DB Model</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Canvas auto-generated via git parsing. Fully zoomable and interactive.</span>
                </div>
              )}

              {demoActiveTab === "chat" && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
                    {/* User Prompt */}
                    <div className="flex gap-2.5 items-start justify-end text-xs">
                      <div className="bg-[#121212] border border-card-border p-3 rounded-xl max-w-[80%] text-slate-200">
                        How is checkout processed? Highlight the database link.
                      </div>
                    </div>
                    {/* AI Prompt */}
                    <div className="flex gap-2.5 items-start text-xs">
                      <div className="w-6 h-6 rounded-md bg-neon-cyan flex items-center justify-center text-black font-extrabold text-[10px]">AI</div>
                      <div className="bg-[#0b0b0b] border border-neon-cyan/20 p-3.5 rounded-xl max-w-[80%] text-slate-300 flex flex-col gap-2">
                        <p>Checkout handles charge verification and triggers database write orders. It uses:</p>
                        <ul className="list-disc pl-4 space-y-1.5 font-mono text-[11px] text-neon-cyan">
                          <li>api/routes/orders.py (Entry Router)</li>
                          <li>api/services/payment_service.py (Charge Execution)</li>
                          <li>database/models.py (Order insertion)</li>
                        </ul>
                        <p className="mt-1 text-[11px] text-slate-500">I have highlighted these 3 canvas nodes and drawn active mapping connections between them.</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-card-border pt-4 flex gap-2">
                    <input readOnly value="Where are JWT configuration keys loaded?" className="flex-1 bg-[#121212] border border-card-border text-xs rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed" />
                    <button className="px-3 py-1.5 rounded-lg bg-neon-cyan text-black text-xs font-semibold">Send</button>
                  </div>
                </div>
              )}

              {demoActiveTab === "pr" && (
                <div className="flex flex-col justify-center h-full max-w-xl mx-auto w-full gap-4 text-xs font-sans">
                  <div className="glass-panel border border-neon-purple/20 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-card-border pb-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-neon-purple" />
                        <span className="font-semibold text-slate-200">PR #47: Add Stripe Webhook Handler</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 font-bold uppercase text-[9px] border border-red-500/20">Arch Drift Detected</span>
                    </div>

                    <p className="text-slate-400 text-xs">
                      This pull request creates a dependency link from <code className="text-neon-cyan">database/connection</code> back into a router module, causing a potential <strong className="text-neon-purple">circular dependency</strong>.
                    </p>

                    <div className="grid grid-cols-4 gap-2 text-center mt-2">
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-card-border">
                        <span className="block text-[10px] text-slate-500 font-medium">Maintainability</span>
                        <strong className="text-lg text-emerald-400">92/100</strong>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-card-border">
                        <span className="block text-[10px] text-slate-500 font-medium">Scalability</span>
                        <strong className="text-lg text-amber-400">74/100</strong>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-card-border">
                        <span className="block text-[10px] text-slate-500 font-medium">Complexity</span>
                        <strong className="text-lg text-emerald-400">88/100</strong>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-card-border">
                        <span className="block text-[10px] text-slate-500 font-medium">Risk Score</span>
                        <strong className="text-lg text-red-400">HIGH</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto border-t border-card-border relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 font-sans">
            Fully Automated Software Architecture System
          </h2>
          <p className="text-slate-400">
            ArchAI goes beyond plain syntax highlighting. It generates static graphs, analyzes branch history, and answers complex structural questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-xl border border-card-border flex flex-col gap-4 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/15 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Repository To Canvas</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scan repositories in seconds. Understand layers of code ranging from controller routes to database interfaces and dependency flow charts.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-xl border border-card-border flex flex-col gap-4 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">AI Architect Console</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask deep questions about code interactions. Click on nodes to locate files, extract bottlenecks, and query performance scaling.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-xl border border-card-border flex flex-col gap-4 hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/15 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">PR Architecture Review</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analyze incoming branches. Keep tabs on technical debt, detect circular import connections, and audit system decoupling scores before merging.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-slate-950/20 border-t border-card-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 font-sans">Transparent Pricing For Every Team</h2>
            <p className="text-slate-400">Unlock continuous code base tracing, AI review audits, and visual scaling copilot templates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Sandbox */}
            <div className="glass-panel p-8 rounded-xl border border-card-border flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Sandbox tier</span>
                <h3 className="text-xl font-bold mb-4">Community</h3>
                <div className="text-3xl font-extrabold mb-4">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                <ul className="space-y-2.5 text-sm text-slate-400 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-cyan" /> 1 Public Repo Scan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-cyan" /> Interactive Canvas Layout</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-cyan" /> Basic AI Chat responses</li>
                </ul>
              </div>
              <Link href="/workspace" className="w-full text-center py-2.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 text-sm transition-all">
                Try Sandbox
              </Link>
            </div>

            {/* Pro tier */}
            <div className="glass-panel p-8 rounded-xl border-2 border-primary/40 flex flex-col justify-between hover:border-primary/60 transition-all relative shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <div className="absolute top-4 right-4 bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Popular</div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Professional</span>
                <h3 className="text-xl font-bold mb-4">Engineering</h3>
                <div className="text-3xl font-extrabold mb-4">$29 <span className="text-sm font-normal text-slate-500">/ mo</span></div>
                <ul className="space-y-2.5 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited Repo Scanning</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Private Repositories Integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> CI/CD Branch Drift Timelines</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Full PR Impact Reviewer</li>
                </ul>
              </div>
              <Link href="/workspace" className="w-full text-center py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all shadow-md shadow-primary/20">
                Get Access
              </Link>
            </div>

            {/* Enterprise tier */}
            <div className="glass-panel p-8 rounded-xl border border-card-border flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Custom tier</span>
                <h3 className="text-xl font-bold mb-4">Enterprise</h3>
                <div className="text-3xl font-extrabold mb-4">Custom <span className="text-sm font-normal text-slate-500">/ annual</span></div>
                <ul className="space-y-2.5 text-sm text-slate-400 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> SSO & SAML Authentication</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> Self-hosted On-Premise deployments</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-neon-purple" /> Custom AST rules & compliance</li>
                </ul>
              </div>
              <a href="#waitlist" className="w-full text-center py-2.5 rounded-lg bg-slate-850 border border-slate-750 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-all">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="px-6 py-24 border-t border-card-border relative">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan mb-6">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 font-sans">Join the ArchAI Beta</h2>
          <p className="text-slate-400 mb-8">
            Be the first to know when we launch automated Slack alerts, private Git integrations, and our local desktop companion.
          </p>

          {waitlistStatus === "success" ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3 w-full justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Awesome! You have been successfully registered on the Waitlist.</span>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full">
              <input 
                type="email" 
                required
                disabled={waitlistStatus === "loading"}
                placeholder="developer@archai.io" 
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-[#0c0c0c] border border-card-border focus:border-neon-cyan focus:outline-none text-sm text-slate-200 transition-all font-mono"
              />
              <button 
                type="submit"
                disabled={waitlistStatus === "loading"}
                className="px-6 py-3 rounded-lg font-semibold bg-neon-cyan text-black text-sm hover:opacity-90 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {waitlistStatus === "loading" ? "Submitting..." : "Join Waitlist"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-8 text-center text-xs text-slate-600 font-mono">
        <p>© 2025 ArchAI — Open Source under the <a href="https://github.com/dharmitshah/archai/blob/main/LICENSE" className="text-slate-500 hover:text-slate-400 transition-colors">MIT License</a>.</p>
        <p className="mt-1.5 text-slate-700">Built for Engineers who think in Systems.</p>
        <div className="mt-3 flex items-center justify-center gap-5 text-slate-700">
          <a href="https://github.com/dharmitshah/archai" className="hover:text-slate-500 transition-colors">GitHub</a>
          <span>·</span>
          <a href="https://github.com/dharmitshah/archai/blob/main/docs/API.md" className="hover:text-slate-500 transition-colors">API Docs</a>
          <span>·</span>
          <a href="https://github.com/dharmitshah/archai/blob/main/CONTRIBUTING.md" className="hover:text-slate-500 transition-colors">Contribute</a>
          <span>·</span>
          <a href="https://github.com/dharmitshah/archai/blob/main/SECURITY.md" className="hover:text-slate-500 transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
}
