'use client'

import { useState, FormEvent, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import FormattedInstructions from '@/components/FormattedInstructions'
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import Image from 'next/image';
import styles from './page.module.css'  // Assuming you have a CSS module for this page

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function TestInstructionsGenerator() {
  const [files, setFiles] = useState<File[]>([])
  const [context, setContext] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDownloading, setIsDownloading] = useState<'json' | 'csv' | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

interface TestingStep {
  step_count: number;
  step_description: string;
}

interface Feature {
  description: string;
  pre_conditions: string;
  expected_result: string;
  testing_steps: TestingStep[];
}
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      setFiles(fileList)
      
      // Generate previews
      const newPreviews = fileList.map(file => URL.createObjectURL(file))
      setPreviews(newPreviews)
    }
  }

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => previews.forEach(preview => URL.revokeObjectURL(preview))
  }, [previews])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (files.length < 5 || files.length > 10) {
      setError('Please upload between 5 and 10 screenshots.')
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('context', context)
    formData.append('output_format', 'json')

    try {
      const response = await fetch(`${apiUrl}/generate_instructions/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to generate instructions')
      }

      const data = await response.json()
      setInstructions(JSON.stringify(data, null, 2))
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`An error occurred while generating instructions: ${error.message}`)
      } else {
        setError('An unknown error occurred while generating instructions')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = (format: 'json' | 'csv') => {
    setIsDownloading(format)
    try {
      // Parse the instructions to remove the extra nesting
      const parsedInstructions = JSON.parse(instructions);
      const features = parsedInstructions.features.features;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify({ features }, null, 2)], { type: 'application/json' })
        saveAs(blob, 'Test Instructions.json')
      } else {
        // Convert JSON to CSV
        const csvData = features.flatMap((feature: Feature, index: number) => 
          feature.testing_steps.map((step: TestingStep) => ({
            'Feature Number': index + 1,
            'Description': feature.description,
            'Pre-conditions': feature.pre_conditions,
            'Expected Result': feature.expected_result,
            'Step Number': step.step_count,
            'Step Description': step.step_description
          }))
        );

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, 'Test Instructions.csv')
      }
    } catch (error) {
      setError(`An error occurred while downloading ${format.toUpperCase()}.`)
    } finally {
      setIsDownloading(null)
    }
  }

  // const downloadCSV = async () => {
  //   try {
  //     const formData = new FormData()
  //     files.forEach(file => formData.append('files', file))
  //     formData.append('context', context)
  //     formData.append('output_format', 'csv')

  //     const response = await fetch(`${apiUrl}/generate_instructions/`, {
  //       method: 'POST',
  //       body: formData,
  //     })

  //     if (!response.ok) {
  //       throw new Error(`Failed to download CSV`)
  //     }

  //     const blob = await response.blob()
  //     saveAs(blob, 'Test Instructions.csv')
  //   } catch (error) {
  //     setError(`An error occurred while downloading CSV.`)
  //   }
  // }

  return (
    <main className={`${styles.main} flex min-h-screen flex-col items-center p-24 bg-white dark:bg-gray-900 text-black dark:text-white`}>
      <div className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-12">
        <h1 className="text-4xl font-bold text-center mb-8 mt-8">
          Testing Instructions Generator
        </h1>
      </div>

      <div className="w-full max-w-4xl"> 
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="images" className="block text-sm font-medium mb-2">
              Upload screenshots (1-15 images)
            </label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mt-1 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
          
          {previews.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Previews</h3>
              <div className="grid grid-cols-5 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="object-cover rounded"
                      layout="fill"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="context" className="block text-sm font-medium mb-2">
              Context (optional)
            </label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="mt-1 bg-white dark:bg-gray-800 text-black dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 py-3 px-10 w-auto"
            >
              {isLoading ? 'Generating...' : 'Generate Testing Instructions'}
            </Button>
          </div>
        </form>

        {instructions && (
          <div className="mt-16">
            <h2 className="text-4xl font-bold mb-8 text-center">Generated Instructions</h2>
            <Card className="p-8 shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
              <CardContent className="max-h-[70vh] overflow-y-auto">
                <FormattedInstructions instructions={instructions} />
              </CardContent>
            </Card>
            <div className="mt-8 flex justify-center space-x-4">
              <Button 
                onClick={() => downloadFile('json')} 
                disabled={isDownloading === 'json'}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 py-3 px-6"
              >
                {isDownloading === 'json' ? 'Downloading...' : 'Download JSON'}
              </Button>
              <Button 
                onClick={() => downloadFile('csv')} 
                disabled={isDownloading === 'csv'}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 py-3 px-6"
              >
                {isDownloading === 'csv' ? 'Downloading...' : 'Download CSV'}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 mt-8">{error}</p>}
      </div>
    </main>
  )
}
