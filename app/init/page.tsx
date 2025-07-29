"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2 } from "lucide-react"

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const initializeSystem = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/init", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.error || "Initialization failed")
      }
    } catch (error) {
      setMessage("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">PixelForge Nexus</CardTitle>
          <CardDescription>System Initialization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={success ? "default" : "destructive"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the button below to initialize the system and create the admin user.
            </p>
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
              <strong>Admin Credentials:</strong>
              <br />
              Email: admin@pixelforge.com
              <br />
              Password: admin123
            </div>
          </div>

          <Button onClick={initializeSystem} disabled={loading || success} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success && <CheckCircle className="mr-2 h-4 w-4" />}
            {success ? "System Initialized" : "Initialize System"}
          </Button>

          {success && (
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
