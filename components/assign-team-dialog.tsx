"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users } from "lucide-react"
import type { User } from "@/lib/db"

interface AssignTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  onAssignmentUpdated: () => void
}

interface DeveloperWithAssignment extends User {
  is_assigned: boolean
}

export function AssignTeamDialog({ open, onOpenChange, projectId, onAssignmentUpdated }: AssignTeamDialogProps) {
  const [developers, setDevelopers] = useState<DeveloperWithAssignment[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      fetchDevelopers()
    }
  }, [open, projectId])

  const fetchDevelopers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/developers`)
      if (response.ok) {
        const data = await response.json()
        setDevelopers(data)
      } else {
        setError("Failed to fetch developers")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentChange = (developerId: number, isAssigned: boolean) => {
    setDevelopers((prev) => prev.map((dev) => (dev.id === developerId ? { ...dev, is_assigned: isAssigned } : dev)))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const assignments = developers.filter((dev) => dev.is_assigned).map((dev) => dev.id)

      const response = await fetch(`/api/projects/${projectId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ developerIds: assignments }),
      })

      if (response.ok) {
        onAssignmentUpdated()
        onOpenChange(false)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update assignments")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assign Team Members
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Developers</CardTitle>
              <CardDescription>Select developers to assign to this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {developers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No developers available</p>
              ) : (
                developers.map((developer) => (
                  <div key={developer.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`dev-${developer.id}`}
                      checked={developer.is_assigned}
                      onCheckedChange={(checked) => handleAssignmentChange(developer.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`dev-${developer.id}`}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div>
                        <p>{developer.name}</p>
                        <p className="text-xs text-muted-foreground">{developer.email}</p>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Assignments
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
