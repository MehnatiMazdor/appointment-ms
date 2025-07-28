"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, Key, Settings, ExternalLink, Copy, CheckCircle, AlertCircle, Code, FileText } from "lucide-react"
import { useState } from "react"

export function SetupInstructions() {
  const [copiedStep, setCopiedStep] = useState<string | null>(null)

  const copyToClipboard = (text: string, step: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envContent = `NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Welcome to AppointMS Setup</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Let's get your appointment management system configured and ready to use
          </p>
        </div>

        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Setup Required:</strong> Your Supabase environment variables are missing or not configured properly.
            Please follow the steps below to complete the setup.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Step 1: Create Supabase Project */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <CardTitle className="text-gray-800 dark:text-white flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Create a Supabase Project
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Set up your backend database and authentication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    supabase.com <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>Sign up for a free account or sign in</li>
                <li>Click "New Project" and fill in the details</li>
                <li>Wait for your project to be created (this may take a few minutes)</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 2: Get API Keys */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <CardTitle className="text-gray-800 dark:text-white flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    Get Your API Keys
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Copy your project URL and anonymous key
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  In your Supabase dashboard, go to <Badge variant="secondary">Settings</Badge> →{" "}
                  <Badge variant="secondary">API</Badge>
                </li>
                <li>
                  Copy your <strong>Project URL</strong>
                </li>
                <li>
                  Copy your <strong>anon/public key</strong> (not the service_role key)
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 3: Environment Variables */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <CardTitle className="text-gray-800 dark:text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configure Environment Variables
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">Create your .env.local file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Create a <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">.env.local</code>{" "}
                  file in your project root with:
                </p>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{envContent}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={() => copyToClipboard(envContent, "env")}
                  >
                    {copiedStep === "env" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Replace <code>your_supabase_project_url</code> and <code>your_supabase_anon_key</code> with the actual
                  values from step 2.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Database Setup */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <CardTitle className="text-gray-800 dark:text-white flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Set Up Database Tables
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Run the SQL scripts to create your database schema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  In your Supabase dashboard, go to <Badge variant="secondary">SQL Editor</Badge>
                </li>
                <li>
                  Run the SQL scripts in the{" "}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">scripts/</code> folder in
                  order:
                </li>
              </ol>
              <div className="ml-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <code className="text-sm">01-create-profiles-table.sql</code>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <code className="text-sm">02-create-appointments-table.sql</code>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <code className="text-sm">03-enable-rls.sql</code>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <code className="text-sm">04-create-policies.sql</code>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <code className="text-sm">05-create-trigger.sql</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Restart Development Server */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm">5</span>
                </div>
                <div>
                  <CardTitle className="text-gray-800 dark:text-white">Restart Your Development Server</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Apply the environment variable changes
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">Stop your development server and restart it:</p>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
                    <code>npm run dev</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={() => copyToClipboard("npm run dev", "restart")}
                  >
                    {copiedStep === "restart" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Almost Done!</strong> Once you complete these steps, refresh this page and you'll see the full
              appointment management system.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
