'use client'

import { Button, Card, Flex, Heading, Spinner, Theme } from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import '@radix-ui/themes/styles.css'
import { SerloEditor, SerloEditorProps, SerloRenderer } from '@serlo/editor'
import React from 'react'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

const initialState = {
  plugin: 'rows',
  state: [{ plugin: 'text' }],
}

export default function Home() {
  return (
    <Theme>
      <QueryClientProvider client={queryClient}>
        <main className="p-5">
          <App />
        </main>
      </QueryClientProvider>
    </Theme>
  )
}

function App() {
  const password = '123456'
  const [inputContent, setInputContent] = React.useState<Content>(initialState)
  const [outputContent, setOutputContent] =
    React.useState<Content>(initialState)
  const [prompt, setPrompt] = React.useState('Vereinfache den Text')
  const [backendResponse, setBackendResponse] = React.useState<unknown>(null)

  const fetchContent = useMutation({
    mutationFn: async ({
      content,
      prompt,
    }: {
      content: string
      prompt: string
    }) => {
      const response = await fetch(
        `/api/generate-content?content=${encodeURIComponent(content)}&prompt=${encodeURIComponent(prompt)}&password=${password}`,
        { method: 'POST' },
      )

      if (!response.ok) {
        console.error('Failed fetch', await response.text())
        throw new Error('Failed fetch')
      }

      const backendResponse = await response.json()

      setBackendResponse(backendResponse)
      setOutputContent(JSON.parse(backendResponse.content))
    },
  })

  return (
    <>
      <Flex gap="3" wrap="wrap">
        <FlexItem>
          <Heading>Input for the generative AI</Heading>
          <SerloEditor
            initialState={inputContent}
            onChange={({ changed, getDocument }) => {
              if (changed) {
                const newState = getDocument()

                if (newState != null) {
                  setInputContent(newState)
                }
              }
            }}
          >
            {(editor) => {
              return <>{editor.element}</>
            }}
          </SerloEditor>
        </FlexItem>
        <FlexItem>
          <Heading>Settings for the generative AI</Heading>
          <Form.Root>
            <Form.Field name="prompt">
              <Form.Label>User Prompt:</Form.Label>
              <Form.Control asChild>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={8}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </Form.Control>
            </Form.Field>
          </Form.Root>
          <Button
            onClick={() =>
              fetchContent.mutate({
                content: JSON.stringify(inputContent, null, 2),
                prompt,
              })
            }
            disabled={fetchContent.isPending}
          >
            Generate Content with AI
          </Button>
        </FlexItem>
        <FlexItem>
          <Heading>Output of the generative AI</Heading>
          {fetchContent.isPending ? <Spinner /> : null}
          <SerloRenderer document={outputContent} />
        </FlexItem>
        <FlexItem>
          <Heading>Response from Backend</Heading>
          <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
        </FlexItem>
      </Flex>
    </>
  )
}

function FlexItem({ children }: { children: React.ReactNode }) {
  return <Card className="min-w-[600px] w-1/3">{children}</Card>
}

type Content = SerloEditorProps['initialState']
