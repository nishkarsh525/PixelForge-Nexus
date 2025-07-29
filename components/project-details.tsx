"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Users,
  FileText,
  Upload,
  Download,
  Eye,
  UserPlus,
  CheckCircle,
  RotateCcw,
  Lightbulb,
} from "lucide-react"
import { UploadDocumentDialog } from "@/components/upload-document-dialog"
import { AssignTeamDialog } from "@/components/assign-team-dialog"
import { analyzeProjectRisks } from "@/lib/ai"
import type { User } from "@/lib/db"

interface ProjectDetailsProps {
  projectId: number
  user: User
}

interface ProjectData {
  id: number
  name: string
  description: string
  deadline: string
  status: "active" | "completed"
  created_by: number
  created_at: string
  team_members: Array<{
    id: number
    name: string
    email: string
    role: "lead" | "developer"
  }>
  documents: Array<{
    id: number
    name: string
    file_path: string
    file_size: number
    mime_type: string
    uploaded_by: number
    uploaded_at: string
    uploader_name: string
  }>
}

export function ProjectDetails({ projectId, user }: ProjectDetailsProps) {
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  useEffect(() => {
    fetchProjectDetails()
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/details`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        setError("Failed to load project details")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: "active" | "completed") => {
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchProjectDetails()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const generateRiskAnalysis = async () => {
    if (!project) return

    setLoadingAnalysis(true)
    try {
      const analysis = await analyzeProjectRisks({
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        teamSize: project.team_members.length,
      })
      setAiAnalysis(analysis)
    } catch (error) {
      console.error("Failed to generate analysis:", error)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const canManageProject = () => {
    if (!project) return false
    return (
      user.role === "admin" ||
      project.created_by === user.id ||
      project.team_members.some((member) => member.id === user.id && member.role === "lead")
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (loading) {
    return <div>Loading project details...</div>
  }

  if (error || !project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Project not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Deadline: {new Date(project.deadline).toLocaleDateString()}
          </p>
        </div>

        {canManageProject() && (
          <div className="flex gap-2">
            {project.status === "active" ? (
              <Button onClick={() => handleStatusChange("completed")} variant="outline">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            ) : (
              <Button onClick={() => handleStatusChange("active")} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reactivate
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>{project.team_members.length} members</CardDescription>
            </div>
            {canManageProject() && (
              <Button variant="outline" size="sm" onClick={() => setShowAssignDialog(true)}>
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.team_members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No team members assigned</p>
              ) : (
                project.team_members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Team Size: {project.team_members.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Documents: {project.documents.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Days Left: {Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiAnalysis ? (
              <div className="text-sm whitespace-pre-wrap">{aiAnalysis}</div>
            ) : (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={generateRiskAnalysis}
                  disabled={loadingAnalysis}
                  className="w-full bg-transparent"
                >
                  {loadingAnalysis ? "Analyzing..." : "Generate Risk Analysis"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>{project.documents.length} documents uploaded</CardDescription>
          </div>
          {canManageProject() && (
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {project.documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)} • Uploaded by {doc.uploader_name} •{" "}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.file_path} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UploadDocumentDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        projectId={projectId}
        onDocumentUploaded={fetchProjectDetails}
      />

      <AssignTeamDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        projectId={projectId}
        onAssignmentUpdated={fetchProjectDetails}
      />
    </div>
  )
}
