import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface TestStep {
  step_count: number
  step_description: string
}

interface Feature {
  description: string
  pre_conditions: string
  testing_steps: TestStep[]
  expected_result: string
}

interface FormattedInstructionsProps {
  instructions: string
}

export default function FormattedInstructions({ instructions }: FormattedInstructionsProps) {
  const parsedInstructions = JSON.parse(instructions)
  const features: Feature[] = parsedInstructions.features.features

  const markdownContent = features.map((feature, index) => `
### Feature ${index + 1}

#### Description
${feature.description}

#### Preconditions
${feature.pre_conditions}

#### Testing Steps
<div style="margin-top: 0.5em;">
${feature.testing_steps.map(step => `<p style="margin: 0.2em 0;"><strong>Step ${step.step_count}:</strong> ${step.step_description}</p>`).join('')}
</div>

#### Expected Result
${feature.expected_result}

---
`).join('\n')

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdownContent}</ReactMarkdown>
    </div>
  )
}
