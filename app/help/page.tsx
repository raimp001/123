import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, MessageSquare, FileText, BookOpen } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-sm text-[#6B7280] hover:text-[#111827] mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Help & Support</h1>
          <p className="text-[#6B7280]">
            Get the help you need to use SciFlow effectively.
          </p>
        </div>

        {/* Contact Options */}
        <div className="space-y-4 mb-12">
          <a 
            href="mailto:support@sciflowlabs.com" 
            className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors"
            style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
          >
            <div className="w-10 h-10 rounded-lg bg-[#6B5FED]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#6B5FED]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] mb-1">Email Support</h3>
              <p className="text-sm text-[#6B7280] mb-2">
                For account issues, payment questions, or technical problems.
              </p>
              <p className="text-sm text-[#6B5FED]">support@sciflowlabs.com</p>
            </div>
          </a>

          <a 
            href="mailto:founders@sciflowlabs.com" 
            className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors"
            style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
          >
            <div className="w-10 h-10 rounded-lg bg-[#6B5FED]/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-[#6B5FED]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827] mb-1">Founding Cohort Support</h3>
              <p className="text-sm text-[#6B7280] mb-2">
                Direct line to the team for founding members.
              </p>
              <p className="text-sm text-[#6B5FED]">founders@sciflowlabs.com</p>
            </div>
          </a>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Resources</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              href="/docs"
              className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors text-center"
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
            >
              <BookOpen className="w-6 h-6 text-[#6B5FED] mx-auto mb-2" />
              <p className="font-medium text-[#111827]">Documentation</p>
              <p className="text-xs text-[#6B7280]">How it works, fees, security</p>
            </Link>

            <Link 
              href="/faq"
              className="p-4 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#6B5FED]/30 transition-colors text-center"
              style={{boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}
            >
              <FileText className="w-6 h-6 text-[#6B5FED] mx-auto mb-2" />
              <p className="font-medium text-[#111827]">FAQ</p>
              <p className="text-xs text-[#6B7280]">Common questions answered</p>
            </Link>
          </div>
        </div>

        {/* Response Time */}
        <div className="p-5 rounded-xl bg-[#6B5FED]/5 border border-[#6B5FED]/20">
          <h3 className="font-semibold text-[#111827] mb-2">Response Times</h3>
          <ul className="text-sm text-[#6B7280] space-y-1">
            <li>• General inquiries: within 24 hours</li>
            <li>• Payment issues: within 4 hours</li>
            <li>• Disputes: within 72 hours (as per protocol)</li>
            <li>• Founding cohort: priority same-day response</li>
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#6B7280] mb-4">
            Can&apos;t find what you need?
          </p>
          <Link href="/docs">
            <Button variant="outline" className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6] rounded-lg">
              Browse Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
