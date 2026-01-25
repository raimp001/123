import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageSquare, FileText, BookOpen } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-serif text-foreground mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Get the help you need to use SciFlow effectively.
          </p>
        </div>

        {/* Contact Options */}
        <div className="space-y-4 mb-12">
          <a 
            href="mailto:support@sciflowlabs.com" 
            className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                For account issues, payment questions, or technical problems.
              </p>
              <p className="text-sm text-accent">support@sciflowlabs.com</p>
            </div>
          </a>

          <a 
            href="mailto:founders@sciflowlabs.com" 
            className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Founding Cohort Support</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Direct line to the team for founding members.
              </p>
              <p className="text-sm text-accent">founders@sciflowlabs.com</p>
            </div>
          </a>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-lg font-medium text-foreground mb-4">Resources</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/docs"
              className="p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors text-center"
            >
              <BookOpen className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="font-medium text-foreground">Documentation</p>
              <p className="text-xs text-muted-foreground">How it works, fees, security</p>
            </Link>

            <Link 
              href="/faq"
              className="p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors text-center"
            >
              <FileText className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="font-medium text-foreground">FAQ</p>
              <p className="text-xs text-muted-foreground">Common questions answered</p>
            </Link>
          </div>
        </div>

        {/* Response Time */}
        <div className="p-5 rounded-xl bg-accent/10 border border-accent/20">
          <h3 className="font-medium text-foreground mb-2">Response Times</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• General inquiries: within 24 hours</li>
            <li>• Payment issues: within 4 hours</li>
            <li>• Disputes: within 72 hours (as per protocol)</li>
            <li>• Founding cohort: priority same-day response</li>
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Can&apos;t find what you need?
          </p>
          <Link href="/docs">
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary rounded-full">
              Browse Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
