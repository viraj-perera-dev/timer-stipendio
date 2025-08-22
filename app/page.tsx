"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Play, Pause, FileText, Euro, Clock, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"

interface PayslipData {
  monthlyGross: number
  monthlyNet: number
  workingHours: number
  fileName: string
}

export default function SalaryTimer() {
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [earnings, setEarnings] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const earningsPerSecond = payslipData ? payslipData.monthlyNet / (payslipData.workingHours * 3600) : 0

  useEffect(() => {
    if (isRunning && payslipData) {
      intervalRef.current = setInterval(() => {
        setEarnings((prev) => prev + earningsPerSecond)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, earningsPerSecond, payslipData])

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Per favore carica un file PDF valido")
      return
    }

    // Simulate PDF parsing - in a real app, you'd use a PDF parsing library
    // and extract actual data from the Italian payslip
    const mockData: PayslipData = {
      monthlyGross: 2500,
      monthlyNet: 1850,
      workingHours: 160, // 8 hours * 20 working days
      fileName: file.name,
    }

    setPayslipData(mockData)
    setEarnings(0)
    setIsRunning(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetTimer = () => {
    setEarnings(0)
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-heading text-foreground">Timer Stipendio</h1>
          <p className="text-muted-foreground">Scopri quanto guadagni ogni secondo</p>
        </div>

        {/* Upload Section */}
        {!payslipData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Carica Busta Paga
              </CardTitle>
              <CardDescription>Carica il PDF della tua busta paga per iniziare</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Trascina qui il PDF della busta paga</p>
                <p className="text-xs text-muted-foreground">oppure clicca per selezionare</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payslip Info */}
        {payslipData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {payslipData.fileName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Stipendio Lordo</p>
                  <p className="font-semibold">{formatCurrency(payslipData.monthlyGross)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stipendio Netto</p>
                  <p className="font-semibold">{formatCurrency(payslipData.monthlyNet)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ore Lavorate</p>
                  <p className="font-semibold">{payslipData.workingHours}h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Per Secondo</p>
                  <p className="font-semibold text-primary">{formatCurrency(earningsPerSecond)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPayslipData(null)} className="w-full">
                Carica Nuova Busta Paga
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Timer Display */}
        {payslipData && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Euro className="h-4 w-4" />
                    <span className="text-sm">Guadagno Attuale</span>
                  </div>
                  <div className="text-4xl font-bold font-heading text-primary">{formatCurrency(earnings)}</div>
                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Tempo: {formatTime(earnings / earningsPerSecond)}</span>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setIsRunning(!isRunning)} className="flex-1" size="lg">
                    {isRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausa
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Avvia
                      </>
                    )}
                  </Button>
                  <Button onClick={resetTimer} variant="outline" size="lg">
                    <Calculator className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                💡 <strong>Come funziona:</strong>
              </p>
              <p>
                Carica la tua busta paga in formato PDF e l'app calcolerà automaticamente quanto guadagni ogni secondo
                basandosi sul tuo stipendio netto e le ore lavorate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
