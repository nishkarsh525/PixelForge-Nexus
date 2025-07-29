"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderOpen, Calendar, FileText, ExternalLink } from "lucide-react"
import type { User, Project } from "@/lib/db"

interface DeveloperDashboardProps {
  user: User
}

interface AssignedProject extends Project {
  document_count: number
  project_lead: string
  document_links: string[]
}

export function DeveloperDashboard({ user }: DeveloperDashboardProps) {
  const [projects, setProjects] = useState<AssignedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignedProjects()
  }, [])

  const fetchAssignedProjects = async () => {
    try {
      const response = await fetch("/api/projects/assigned")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch assigned projects:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name}</h1>
        <p className="text-muted-foreground">Your assigned projects and tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.reduce((total, project) => total + project.document_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Projects</CardTitle>
          <CardDescription>Projects you are currently working on</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No projects assigned yet</p>
              <p className="text-sm">Contact your project lead to get assigned to projects</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {project.description} <br />
                      Documents: {project.document_count}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                      <span>Lead: {project.project_lead}</span>
                    </div>
                    {project.document_links.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Document Links:</h4>
                        <ul className="list-disc list-inside">
                          {project.document_links.map((link, index) => (
                            <li key={index}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Document {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/projects/${project.id}`}>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Details
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
